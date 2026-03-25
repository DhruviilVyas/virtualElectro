import express from 'express';
import { protect } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// 🟢 1. CUSTOMER: Raise a new Repair Ticket
router.post('/', protect, async (req, res) => {
  try {
    const { deviceCategory, issueDescription, address } = req.body;
    const fee = 500; // Fixed visiting charge
    const customerId = req.user._id;

    // A. Check Wallet Balance & Deduct (Escrow)
    const user = await User.findOneAndUpdate(
      { _id: customerId, walletBalance: { $gte: fee } },
      { $inc: { walletBalance: -fee } },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(400).json({ error: "Insufficient Wallet Balance (Requires 500 Coins)" });
    }

    // B. Create Ticket
    const newTicket = new Ticket({
      customerId,
      customerName: req.user.name,
      deviceCategory,
      issueDescription,
      address,
      fee
    });

    await newTicket.save();

    res.status(201).json({ success: true, message: "Technician requested successfully!", ticket: newTicket });
  } catch (error) {
    res.status(500).json({ error: "Failed to raise ticket" });
  }
});

// 🟠 2. TECHNICIAN: Get all 'Open' Tickets nearby
router.get('/open', protect, async (req, res) => {
  try {
    if (req.user.role !== 'technician') return res.status(403).json({ error: "Only technicians can view open jobs." });
    
    const tickets = await Ticket.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// 🟠 3. TECHNICIAN: Accept a Ticket
router.put('/:id/accept', protect, async (req, res) => {
  try {
    if (req.user.role !== 'technician') return res.status(403).json({ error: "Unauthorized" });

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, status: 'Open' }, // Ensure no one else took it
      { 
        status: 'Assigned', 
        technicianId: req.user._id,
        technicianName: req.user.name 
      },
      { new: true }
    );

    if (!ticket) return res.status(400).json({ error: "Ticket already taken or not found." });

    res.json({ success: true, message: "Job Accepted!", ticket });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept job" });
  }
});

// 🟠 4. TECHNICIAN: Complete Job & GET PAID! 💰
router.put('/:id/complete', protect, async (req, res) => {
  try {
    if (req.user.role !== 'technician') return res.status(403).json({ error: "Unauthorized" });

    const ticket = await Ticket.findOne({ _id: req.params.id, technicianId: req.user._id, status: 'Assigned' });
    if (!ticket) return res.status(404).json({ error: "Active job not found." });

    // Mark completed
    ticket.status = 'Completed';
    await ticket.save();

    // 💰 PAY THE TECHNICIAN
    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: ticket.fee } });

    // Record Passbook Transaction
    await Transaction.create({
      fromUser: ticket.customerId,
      toUser: req.user._id,
      amount: ticket.fee,
      type: 'service',
      referenceId: ticket._id
    });

    res.json({ success: true, message: `Job Done! ₹${ticket.fee} added to your wallet.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete job" });
  }
});

export default router;