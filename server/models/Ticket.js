import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  
  // Technician shuru mein nahi hoga, baad mein assign hoga
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  technicianName: { type: String },

  deviceCategory: { type: String, required: true }, // e.g., 'AC', 'Laptop', 'Washing Machine'
  issueDescription: { type: String, required: true },
  address: { type: String, required: true },
  
  // Standard Service Fee
  fee: { type: Number, default: 500 }, 
  
  status: { 
    type: String, 
    enum: ['Open', 'Assigned', 'Completed', 'Cancelled'], 
    default: 'Open' 
  }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);