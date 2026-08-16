import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String },
  image: { type: String, default: "📦" },
  offer: { type: String },
  // Flash Sale Specific Fields
isFlashSale: { type: Boolean, default: false },
flashPrice: { type: Number },
flashStock: { type: Number }, // Normal stock se alag flash sale ka quota
saleStartTime: { type: Date },
  // 👉 THE PRO-SECURITY FIX: Har product par uske Merchant ka permanent thappa (ID)
  merchantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  shopName: { type: String, required: true }

}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);