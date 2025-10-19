const asyncHandler = require("express-async-handler");
const DiscountSettings = require("../models/discountSettingsModel");

exports.getDiscountSettings = asyncHandler(async (req, res) => {
    const settings = (await DiscountSettings.findOne()) || {
        minDiscountTotal: 0,
        discountPercent: 0,
        isDiscountActive: false,
    };

    res.status(200).json({
        status: "success",
        data: settings,
    });
});

exports.getDiscountSettingsPublic = asyncHandler(async (req, res) => {
    const settings = await DiscountSettings.findOne({ isDiscountActive: true });

    if (!settings) {
        return res.status(404).json({
            status: "fail",
            message: "No active discount settings found",
        });
    }

    res.status(200).json({
        status: "success",
        data: settings,
    });
});


exports.updateDiscountSettings = asyncHandler(async (req, res) => {
    const { minDiscountTotal, discountPercent, isDiscountActive } = req.body;

    const settings = await DiscountSettings.findOneAndUpdate(
        {},
        { minDiscountTotal, discountPercent, isDiscountActive },
        { new: true, upsert: true }, 
    );

    res.status(200).json({
        status: "success",
        message: "Discount settings updated successfully",
        data: settings,
    });
});
