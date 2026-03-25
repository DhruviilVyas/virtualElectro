// server/models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisne pay kiya
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Jisko mila
  amount: { type: Number, required: true },
  type: { type: String, enum: ['purchase', 'refund', 'transfer', 'tip'], default: 'purchase' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Kis order ke liye payment hui
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);