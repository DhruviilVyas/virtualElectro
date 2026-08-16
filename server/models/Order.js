import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

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
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
    index: { expires: 0 } // 👈 TTL INDEX
  },
  
  customerName: { type: String },
  trackingId: { type: String } // Courier tracking
}, 

{
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;