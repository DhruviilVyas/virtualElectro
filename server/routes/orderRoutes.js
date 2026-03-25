import express from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// 🛒 1. PRO-LEVEL SECURE CHECKOUT (Order Splitting + Wallet + Smart Sync)
router.post('/', protect, async (req, res) => {
  let isMoneyDeducted = false; 
  let finalPayableAmount = 0;
  const customerId = req.user._id;

  try {
    const { items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Empty order" });
    }

    const customerName = req.user.name || "Customer";
    let calculatedTotal = 0;
    const enrichedItems = [];

    // 👉 1. THE SMART SYNC: Backend Database par bharosa karega, Frontend par nahi
    for (const item of items) {
      // Find the exact product in the DB to get its TRUE price and TRUE owner
      const dbProduct = await Product.findById(item.productId);
      
      if (!dbProduct) return res.status(404).json({ error: "Product not found in database" });
      if (dbProduct.stock < item.quantity) return res.status(400).json({ error: `Out of stock: ${dbProduct.name}` });

      // 🔥 THE BULLETPROOF FIX: We don't care what frontend sends, we use DB's merchantId!
      const actualMerchantId = dbProduct.merchantId ? dbProduct.merchantId.toString() : null;

      if (!actualMerchantId) {
        return res.status(400).json({ error: `System Error: Product ${dbProduct.name} has no owner.` });
      }

      const itemTotal = dbProduct.price * item.quantity;
      calculatedTotal += itemTotal;

      enrichedItems.push({
        product: dbProduct._id, 
        quantity: item.quantity,
        price: dbProduct.price, // Always use DB price to prevent frontend hacking
        merchantId: actualMerchantId, 
        shopName: dbProduct.shopName || "ElectroCare"
      });
    }

    // Bill Calculations
    const shipping = calculatedTotal > 1000 ? 0 : 50;
    const tax = Math.round(calculatedTotal * 0.18);
    finalPayableAmount = calculatedTotal + shipping + tax;

    // Auto Fund
    const currentUser = await User.findById(customerId);
    if (currentUser && currentUser.walletBalance === undefined) {
      currentUser.walletBalance = 1000;
      await currentUser.save();
    }

    // Atomic Wallet Deduction
    const updatedCustomer = await User.findOneAndUpdate(
      { _id: customerId, walletBalance: { $gte: finalPayableAmount } }, 
      { $inc: { walletBalance: -finalPayableAmount } },                 
      { returnDocument: 'after' }
    );

    if (!updatedCustomer) {
      return res.status(400).json({ error: "Insufficient Wallet Balance! Transaction Failed." });
    }

    isMoneyDeducted = true;

    // 👉 3. PROCESS ORDERS AND SPLIT
    const ordersByMerchant = {};
    const transactionLogs = [];

    for (const item of enrichedItems) {
      const mId = item.merchantId; // This is now guaranteed to be a string

      if (!ordersByMerchant[mId]) {
        ordersByMerchant[mId] = {
          customerId,
          customer: customerName,
          merchantId: mId,
          products: [],
          totalAmount: 0 
        };
      }
      
      ordersByMerchant[mId].products.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        shopName: item.shopName,
        merchantId: mId
      });
      
      ordersByMerchant[mId].totalAmount += (item.price * item.quantity); 
    }

    const savedOrders = [];

    for (const mId in ordersByMerchant) {
      const merchantOrderData = ordersByMerchant[mId];
      const merchantCredit = merchantOrderData.totalAmount; 
      
      const subtotal = merchantCredit;
      const mShipping = subtotal > 1000 ? 0 : 50;
      const mTax = Math.round(subtotal * 0.18);
      const splitOrderTotal = subtotal + mShipping + mTax;

      // Schema matching
      const newOrder = new Order({
        customerId: merchantOrderData.customerId,
        merchantId: mId, 
        customerName: merchantOrderData.customer,
        products: merchantOrderData.products,
        totalAmount: splitOrderTotal,
        total: splitOrderTotal,       
        shippingAddress: shippingAddress || "Address not provided",
        status: "pending" // Initial status
      });
      
      const savedOrder = await newOrder.save();
      savedOrders.push(savedOrder);

      // Credit Merchant
      await User.findByIdAndUpdate(mId, { $inc: { walletBalance: merchantCredit } });

      // Log
      transactionLogs.push({
        fromUser: customerId,
        toUser: mId,
        amount: merchantCredit,
        type: 'purchase',
        referenceId: savedOrder._id
      });

      // Deduct Stock
      for (const p of merchantOrderData.products) {
        await Product.findByIdAndUpdate(p.product, { $inc: { stock: -p.quantity } });
      }
    }

    if(transactionLogs.length > 0) {
       await Transaction.insertMany(transactionLogs);
    }

    // Clear Cart
    await User.findByIdAndUpdate(customerId, { $set: { cart: [] } });

    res.status(201).json({
      success: true,
      message: "Order Secured!",
      remainingBalance: updatedCustomer.walletBalance,
      orders: savedOrders
    });

  } catch (error) {
    console.error("🚨 Critical Checkout Error:", error);
    if (isMoneyDeducted) {
      await User.findByIdAndUpdate(customerId, { $inc: { walletBalance: finalPayableAmount } });
    }
    res.status(500).json({ error: "Transaction Failed. Refunded." });
  }
});

// 🕒 2. MY ORDERS (Customer History)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🚚 3. UPDATE ORDER STATUS (Strictly Merchant Control)
// 🚚 3. UPDATE ORDER STATUS (Bypass Security for Development)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 🔥 THE BYPASS: Agar user merchant hai, toh update allow kardo! (No strict checking)
    if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
       return res.status(403).json({ error: "Only merchants can update orders." });
    }

    // Update the status safely
    order.status = status;
    if (trackingId) {
       order.trackingId = trackingId;
    }
    
    await order.save();
    res.json({ success: true, message: `Order marked as ${status}`, order });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// 🏪 4. ALL ORDERS (Merchant Dashboard - SMART FETCH)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'merchant') {
      // 🔥 THE BYPASS: Purane (products array) aur Naye (root level) dono orders fetch karega!
      query = {
        $or: [
          { merchantId: req.user._id },
          { "products.merchantId": req.user._id }
        ]
      };
    }

    const orders = await Order.find(query)
      .populate('productId', 'name price image') // Legacy structure support
      .populate('products.product')              // New structure support
      .sort({ createdAt: -1 });

    res.json(orders || []);
  } catch (err) {
    console.error("Error fetching merchant orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
