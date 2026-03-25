import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 👇👇👇 YEH LINE TUMHARE CODE MEIN MISSING THI 👇👇👇
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 👆👆👆 ISKE BINA DASHBOARD KABHI ORDER NAHI DHOONDH PAYEGA 👆👆👆

  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    shopName: { type: String },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  }],

  // Backward Compatibility 
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
  quantity: { type: Number },
  total: { type: Number },

  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] 
  },
  customerName: { type: String },
  trackingId: { type: String } // Courier tracking
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;