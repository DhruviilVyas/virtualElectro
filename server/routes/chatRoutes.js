import express from 'express';
import mongoose from 'mongoose'; // 👈 Validation ke liye import kiya
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// 1. Get list of all contacts (Inbox)
router.get('/contacts', protect, async (req, res) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }]
    })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .sort({ createdAt: -1 });

    const contactsMap = new Map();

    messages.forEach(msg => {
      // Safety check agar user delete ho gaya ho
      if (!msg.senderId || !msg.receiverId) return;

      const isMeSender = msg.senderId._id.toString() === myId.toString();
      const otherUser = isMeSender ? msg.receiverId : msg.senderId;
      const otherId = otherUser._id.toString();

      if (!contactsMap.has(otherId)) {
        contactsMap.set(otherId, {
          contactId: otherId,
          contactName: otherUser.name || "Customer",
          lastMessage: msg.text,
          time: msg.createdAt,
          unreadCount: (!isMeSender && !msg.isRead) ? 1 : 0
        });
      } else {
        if (!isMeSender && !msg.isRead) {
          contactsMap.get(otherId).unreadCount += 1;
        }
      }
    });

    res.json(Array.from(contactsMap.values()));
  } catch (error) {
    console.error("Contacts Fetch Error:", error);
    res.status(500).json({ error: "Could not fetch contacts" });
  }
});

// 2. Get chat history (With Anti-Crash Logic)
router.get('/:otherUserId', protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.otherUserId;

    // 👉 FIX: Check if ID is a valid MongoDB ObjectId (Crash se bachane ke liye)
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      console.log(`⚠️ Mock ID Detected (${otherId}). Returning empty chat history.`);
      return res.json([]); // Mock data par crash hone se bachega
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ error: "Could not fetch chat history" });
  }
});

export default router;