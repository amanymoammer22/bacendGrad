const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        cartItems: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                size: String,
                price: Number,
                imageCover: {
                    type: String,
                },
            },
        ],

        totalCartPrice: Number,
        discountAmount: {
            type: Number,
            default: 0,
        },
        discountPercent: { type: Number, default: 0 },
        totalPriceAfterDiscount: Number,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);
