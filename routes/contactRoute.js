
const express = require("express");
const { simpleSubscribe, subscribeUser, sendToSubscribers, replyToUser, getAllInquiries } = require("../services/contactService");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

router.post("/subscribe", simpleSubscribe);
router.post("/", subscribeUser);
router.post("/send", protect, allowedTo("admin"), sendToSubscribers);
router.post("/reply/:id", protect, allowedTo("admin"), replyToUser);
router.get("/", protect, allowedTo("admin"), getAllInquiries);

module.exports = router;
