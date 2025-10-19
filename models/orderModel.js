const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Order must be belong to user"],
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                },
                quantity: Number,
                size: String,
                price: Number,
            },
        ],

        taxPrice: {
            type: Number,
            default: 0,
        },
        shippingAddress: {
            details: String,
            phone: String,
            city: String,
            postalCode: String,
            country: String,
            name: String,
            email: String,
        },
        shippingPrice: {
            type: Number,
            default: 0,
        },
        totalOrderPrice: {
            type: Number,
        },
        paymentMethodType: {
            type: String,
            enum: ["card", "cash"],
            default: "cash",
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
    },

    { timestamps: true },
);
orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "firstName secondName email phone",
    }).populate({
        path: "cartItems.product",
        select: "title imageCover",
    });

    next();
});

module.exports = mongoose.model("Order", orderSchema);
