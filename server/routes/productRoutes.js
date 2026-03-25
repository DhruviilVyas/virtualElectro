import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
const router = express.Router();

// 🟢 PUBLIC: Koi bhi (Customer/Guest) saare products dekh sakta hai
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🟠 PROTECTED: Ek Merchant sirf APNE products dekh payega
// ⚠️ RULE: This MUST be ABOVE `/:id` route
router.get('/my-inventory', protect, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const myProducts = await Product.find({ merchantId: req.user._id }).sort({ createdAt: -1 });
    res.json(myProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch your inventory" });
  }
});

// 🟢 PUBLIC: Single product detail dekhne ke liye (THE FIX IS HERE)
// ⚠️ RULE: This MUST be BELOW static routes like `/my-inventory`
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Invalid Product ID" });
  }
});

// 🔴 SECURE ADD: Backend khud JWT Token se Merchant ki ID nikalega
router.post('/', protect, authorize('merchant', 'admin'), upload.single('image'), async (req, res) => {
  try {
    // 1. Cloudinary ne photo save karke hume URL de diya hoga (req.file.path mein)
    const imageUrl = req.file ? req.file.path : "https://via.placeholder.com/150"; // Agar photo na ho toh placeholder

    // 2. Product DB mein save karo
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      image: imageUrl, // 👈 Cloudinary ka URL yahan save hoga!
      merchantId: req.user._id, 
      shopName: req.user.name  
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Product upload error:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 🔴 SECURE UPDATE: Pehle check karega ki kya ye product is merchant ka hai?
router.put('/:id', protect, authorize('merchant', 'admin'),upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // SECURITY CHECK: Dusra merchant edit nahi kar sakta
    if (product.merchantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: You do not own this product!" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🔴 SECURE DELETE: Pehle check karega ownership
router.delete('/:id', protect, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // SECURITY CHECK: Dusra merchant delete nahi kar sakta
    if (product.merchantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: You do not own this product!" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted from Database" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;