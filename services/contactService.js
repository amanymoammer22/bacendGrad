const Subscriber = require("../models/contactModel");
const sendEmail = require("../utils/sendEmail");


exports.subscribeUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });

     
        let existing = await Subscriber.findOne({ email });

        if (existing) {
            existing.adminReplies.push({
                message,
                date: new Date(),
            });

            await existing.save();

            await sendEmail({
                email,
                subject: "We received your new message - Turathna",
                message: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2>Hello ${existing.firstName || "Dear"},</h2>
                  <p>We’ve received your new message:</p>
                  <blockquote>${message}</blockquote>
                  <p>Our support team will get back to you soon!</p>
                  <p style="margin-top: 20px;">Best regards,<br>
                  <strong>The Turathna Team</strong></p>
                </div>
              `,
            });

            return res.status(200).json({ message: "Message added to existing user" });
        }

        const newSubscriber = await Subscriber.create({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message,
        });

        await sendEmail({
            email,
            subject: "Thank You for Contacting Turathna",
            message: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Hello ${firstName},</h2>
                <p>Thank you for reaching out to <strong>Turathna</strong> 🌿.</p>
                <p>We’ve received your message and our support team will review your inquiry shortly.</p>
                <p>Best regards,<br><strong>The Turathna Team</strong></p>
              </div>
            `,
        });

        res.status(201).json({ message: "Subscribed successfully!" });
    } catch (error) {
        console.error("Error in subscribeUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};
 
exports.sendToSubscribers = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) return res.status(400).json({ message: "Subject and message are required" });

        const subscribers = await Subscriber.find();

        if (!subscribers.length) return res.status(404).json({ message: "No subscribers found" });

        for (const sub of subscribers) {
            await sendEmail({
                email: sub.email,
                subject,
                message: `Hello ${sub.firstName || "Subscriber"},\n\n${message}`,
            });
        }

        res.status(200).json({ message: "Emails sent successfully to all subscribers!" });
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ message: "Failed to send emails" });
    }
};


exports.simpleSubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });

        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already subscribed" });
        }

        await Subscriber.create({ email });

        await sendEmail({
            email,
            subject: "Welcome to Turathna Newsletter 🌿",
            message: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Hello,</h2>
          <p>Thank you for subscribing to <strong>Turathna</strong>!</p>
          <p>You'll now receive updates, cultural stories, and exclusive product offers.</p>
          <p style="margin-top: 20px;">Best regards,<br>
          <strong>The Turathna Team</strong><br>
          <a href="https://turathna.com" style="color: #1abc9c;">www.turathna.com</a></p>
        </div>
      `,
        });

        res.status(201).json({ message: "Subscribed successfully!" });
    } catch (error) {
        console.error("Error in simpleSubscribe:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.replyToUser = async (req, res) => {
    try {
        const { id } = req.params; 
        const { replyMessage } = req.body;

        if (!replyMessage) {
            return res.status(400).json({ message: "Reply message is required" });
        }

        const userContact = await Subscriber.findById(id);
        if (!userContact) {
            return res.status(404).json({ message: "User inquiry not found" });
        }

        await sendEmail({
            email: userContact.email,
            subject: `Reply to your inquiry - Turathna`,
            message: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>Hello ${userContact.firstName || "there"},</h3>
        <p>${replyMessage}</p>
        <p style="margin-top: 20px;">Best regards,<br>
        <strong>The Turathna Team</strong></p>
      </div>
      `,
        });

        userContact.adminReplies.push({
            message: replyMessage,
            date: new Date(),
        });

        await userContact.save();

        res.status(200).json({ message: "Reply sent successfully" });
    } catch (error) {
        console.error("Error replying to user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Subscriber.find().sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ message: "Server error" });
    }
};

