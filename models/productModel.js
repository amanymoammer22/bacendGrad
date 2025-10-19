const mongoose = require("mongoose");
const slugify = require("slugify");
const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Too short product title"],
            maxlength: [100, "Too long product title"],
        },
        slug: {
            type: String,
            required: false,
            lowercase: true,
           
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            minlength: [20, "Too short product description"],
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            trim: true,
            max: [2000, "Too long product price"],
        },
        priceAfterDiscount: {
            type: Number,
        },
        hasSize: {
            type: Boolean,
            default: true,
        },

        size: [String],
        imageCover: {
            type: String,
            required: [false, "Product Image cover is required"],
        },

        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [false, "Product must be belong to category"],
        },
    },
    { timestamps: true },
);

// Mongoose query middleware
productSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});


module.exports = mongoose.model("Product", productSchema);
