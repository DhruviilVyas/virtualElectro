// server/middleware/upload.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cloudinary ko apne account ki chabi (keys) do
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Setup (Photo kahan aur kaise save hogi)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'electrocare_products', // Cloudinary mein is naam ka folder ban jayega
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Sirf photos allow karenge
  },
});

// 3. Multer Middleware ready karo
const upload = multer({ storage: storage });

export default upload;