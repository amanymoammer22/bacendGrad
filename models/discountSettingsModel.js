const mongoose = require("mongoose");

const discountSettingsSchema = new mongoose.Schema({
    minDiscountTotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    isDiscountActive: { type: Boolean, default: false },
});

module.exports = mongoose.model("StoreSettings", discountSettingsSchema);
