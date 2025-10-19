const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, unique: true },
        phone: { type: String },
        subject: { type: String },
        message: { type: String },
        adminReplies: [
            {
                message: { type: String, required: true },
                date: { type: Date, default: Date.now },
            },
        ],

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);
