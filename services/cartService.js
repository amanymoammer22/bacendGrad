const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const DiscountSettings = require("../models/discountSettingsModel");



const calcTotalCartPrice = async (cart) => {
  let totalPrice = 0;
  for (const item of cart.cartItems) {
    totalPrice += item.quantity * item.price;
  }

  cart.totalCartPrice = totalPrice;

  const discountSettings = await DiscountSettings.findOne({ isDiscountActive: true });

  if (discountSettings && totalPrice >= discountSettings.minDiscountTotal) {
    const discount = (totalPrice * discountSettings.discountPercent) / 100;
    cart.totalPriceAfterDiscount = totalPrice - discount;
    cart.discountAmount = discount;
    cart.discountPercent = discountSettings.discountPercent;
  } else {
    cart.totalPriceAfterDiscount = totalPrice;
      cart.discountAmount = 0;
      cart.discountPercent = 0;
  }

  return totalPrice;
};


const pickImage = (product) => product?.imageCover || (Array.isArray(product?.images) ? product.images[0] : null) || "/images/placeholder.png";

// @desc    Add product to cart

// @desc    Add product to cart
exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const { productId, size } = req.body;

    const product = await Product.findById(productId).lean();
    if (!product) return next(new ApiError("Product not found", 404));

    if (product.hasSize && !size) {
        return next(new ApiError("Size is required for this product", 400));
    }

    if (product.quantity === 0) {
        return next(new ApiError("This product is out of stock", 400));
    }

    const finalSize = product.hasSize ? size : null;

    const effectivePrice = product.priceAfterDiscount && product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            cartItems: [
                {
                    product: productId,
                    size: finalSize,
                    price: effectivePrice,
                    imageCover: pickImage(product),
                },
            ],
        });
    } else {
        const idx = cart.cartItems.findIndex((it) => it.product.toString() === productId && (finalSize ? it.size === finalSize : it.size == null));

        if (idx > -1) {
            const item = cart.cartItems[idx];
              if (item.quantity + 1 > product.quantity) {
                  return next(new ApiError("Not enough stock available for this product", 400));
          }
           item.quantity += 1;
            item.imageCover = pickImage(product);
            cart.cartItems[idx] = item;
        }
        else {
            if (product.quantity < 1) {
                return next(new ApiError("Not enough stock available for this product", 400));
            }
            cart.cartItems.push({
                product: productId,
                size: finalSize,
                price: effectivePrice,
                imageCover: pickImage(product),
  });
}
    }

    await calcTotalCartPrice(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
        path: "cartItems.product",
        select: "title price imageCover hasSize size",
    });

    res.status(200).json({
        status: "success",
        message: "Product added to cart successfully",
        totalCartPrice: cart.totalCartPrice,
        totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
        numOfCartItems: populatedCart.cartItems.length,
        data: populatedCart,
    });
});


// @desc    Get logged user cart
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate({ path: "cartItems.product", select: "title price imageCover title price imageCover hasSize size " });

    if (!cart) return next(new ApiError(`There is no cart for this user id : ${req.user._id}`, 404));

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});


// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        {
            $pull: { cartItems: { _id: req.params.itemId } },
        },
        { new: true },
    );

    await calcTotalCartPrice(cart);
    cart.save();

     const populatedCart = await Cart.findById(cart._id).populate({
    path: "cartItems.product",
    select: "title price imageCover hasSize size",
  });

  res.status(200).json({
    status: "success",
    numOfCartItems: populatedCart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ApiError(`there is no cart for user ${req.user._id}`, 404));
    }

    const itemIndex = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex > -1) {
        const cartItem = cart.cartItems[itemIndex];
        cartItem.quantity = quantity;
        cart.cartItems[itemIndex] = cartItem;
    } else {
        return next(new ApiError(`there is no item for this id :${req.params.itemId}`, 404));
    }

    await calcTotalCartPrice(cart);
    await cart.save();
  const populatedCart = await Cart.findById(cart._id)
      .populate({
          path: "cartItems.product",
          select: "title price imageCover size hasSize",
      })

  res.status(200).json({
      status: "success",
      numOfCartItems: populatedCart.cartItems.length,
      data: populatedCart,
  });

});

