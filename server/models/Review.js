import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Kis shop ko review diya gaya?
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Kisne review diya? (To show their name/initial)
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true }, // For easy display
  
  // Review Details
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true }
}, {
  timestamps: true // Ye date/time automatically save karega
});

export default mongoose.model('Review', reviewSchema);  