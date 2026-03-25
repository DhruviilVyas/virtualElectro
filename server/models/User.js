import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'merchant', 'admin', 'technician'], default: 'customer' },
  image: { type: String, default: "" },
  
  // 👉 THE VIRTUAL ECONOMY SETUP
  walletBalance: { type: Number, default: 1000 }, // Sabko welcome bonus milega
  
  addresses: [{
    label: String,
    address: String,
    isDefault: Boolean
  }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);