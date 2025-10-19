const express = require("express");
const { getDiscountSettings, updateDiscountSettings , getDiscountSettingsPublic } = require("../services/discountSettingsService");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();
router.get("/public", getDiscountSettingsPublic);
router.route("/").get(protect, allowedTo("admin"), getDiscountSettings).put(protect, allowedTo("admin"), updateDiscountSettings);

module.exports = router;
