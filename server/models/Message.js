// server/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true // Automatically adds createdAt (for message time)
});

export default mongoose.model('Message', messageSchema);