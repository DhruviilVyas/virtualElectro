import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Review from '../models/Review.js'; 
import upload from '../middleware/upload.js';
import Transaction from '../models/Transaction.js';
const router = express.Router();

// ==========================================
// 📍 ADDRESS MANAGEMENT ROUTES (FIXED 404)
// ==========================================
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) { res.status(500).json({ error: "Failed to fetch addresses" }); }
});

router.post('/addresses', protect, async (req, res) => {
  try {
    const { label, address, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const makeDefault = isDefault || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push({ label, address, isDefault: makeDefault });
    await user.save();
    
    res.status(201).json({ message: "Address saved successfully", addresses: user.addresses });
  } catch (error) { res.status(500).json({ error: "Failed to save address" }); }
});

// ==========================================
// 🛒 CART & WISHLIST ROUTES
// ==========================================
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (error) { res.status(500).json({ error: "Failed to fetch cart" }); }
});

router.post('/cart', protect, async (req, res) => {
  try {
    const { productId, quantity, action } = req.body;
    const user = await User.findById(req.user._id);
    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      if (action === "set") user.cart[itemIndex].quantity = quantity; 
      else user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    res.json({ message: "Cart updated", cart: user.cart });
  } catch (error) { res.status(500).json({ error: "Failed to update cart" }); }
});

router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    res.json({ message: "Item removed", cart: user.cart });
  } catch (error) { res.status(500).json({ error: "Failed to remove item" }); }
});

router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) { res.status(500).json({ error: "Failed to fetch wishlist" }); }
});

router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);
    if (index > -1) user.wishlist.splice(index, 1);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ message: "Wishlist updated", wishlist: user.wishlist });
  } catch (error) { res.status(500).json({ error: "Failed to update wishlist" }); }
});

// ==========================================
// 🏬 MERCHANT & REVIEWS ROUTES
// ==========================================
router.get('/merchants', async (req, res) => {
  try {
    const merchants = await User.find({ role: 'merchant' }).select('name email');
    res.json(merchants);
  } catch (error) { res.status(500).json({ error: "Failed to fetch merchants" }); }
});

router.get('/merchants/:id', async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name email');
    if(!merchant) return res.status(404).json({ error: "Shop not found" });
    res.json(merchant);
  } catch (error) { res.status(500).json({ error: "Invalid Shop ID" }); }
});

router.get('/merchants/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ shopId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) { res.status(500).json({ error: "Failed to fetch reviews" }); }
});

router.post('/merchants/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const existingReview = await Review.findOne({ shopId: req.params.id, customerId: req.user._id });
    
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.text = text;
      await existingReview.save();
      return res.json({ message: "Review updated", review: existingReview });
    }

    const newReview = new Review({
      shopId: req.params.id,
      customerId: req.user._id,
      customerName: req.user.name,
      rating,
      text
    });
    await newReview.save();
    res.status(201).json({ message: "Review added", review: newReview });
  } catch (error) { res.status(500).json({ error: "Failed to submit review" }); }
});
// server/routes/userRoutes.js
// ... baaki saare routes ke neeche ...

// server/routes/userRoutes.js
// server/routes/userRoutes.js
router.put('/profile-pic', protect, upload.single('image'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ error: "No image provided" });
    
    // 👉 FIX: { new: true } hata kar { returnDocument: 'after' } laga diya
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { image: req.file.path }, 
      { returnDocument: 'after' } 
    ).select('-password'); // Password frontend par mat bhejo

    res.json(user);
  } catch (err) {
    console.error("Image Upload Error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});
router.get('/passbook', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch transactions where user is either sender OR receiver
    const transactions = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }]
    })
    .sort({ createdAt: -1 }) // Newest first
    .populate('fromUser', 'name')
    .populate('toUser', 'name');

    // Data ko frontend ke liye easy banate hain
    const formattedHistory = transactions.map(tx => {
      // Check if money came IN or went OUT
      const isCredit = tx.toUser && tx.toUser._id.toString() === userId.toString();
      
      return {
        _id: tx._id,
        amount: tx.amount,
        type: tx.type, // 'purchase', 'refund', 'tip', etc.
        isCredit,
        // Agar credit hai toh kisne bheja? Agar debit hai toh kisko bheja?
        partnerName: isCredit ? (tx.fromUser?.name || "System") : (tx.toUser?.name || "Unknown Shop"),
        date: tx.createdAt
      };
    });

    res.json({
      walletBalance: req.user.walletBalance || 0,
      transactions: formattedHistory
    });

  } catch (error) {
    console.error("Passbook Fetch Error:", error);
    res.status(500).json({ error: "Failed to load passbook" });
  }
});
export default router;