import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet'; 

import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; 
import jwt from 'jsonwebtoken';
import ticketRoutes from './routes/ticketRoutes.js';

const JWT_SECRET = process.env.JWT_SECRET || "electrocare_super_secret_key_2026";

const app = express();

const httpServer = createServer(app);

// 👉 FIX 1: EXACT URLs WITHOUT TRAILING SLASHES!
const allowedOrigins = [
  'https://virtual-electro.vercel.app', // 👈 Tumhara main Vercel URL
  'https://virtual-electro-ebnnkymu3-dhruvils-projects-9a843109.vercel.app', // Backup Vercel URL
  'http://localhost:5173',
  'http://localhost:3000'
];

// 👉 FIX 2: CORS SABSE UPAR HONA CHAHIYE
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet()); 
app.use(express.json()); 

// 3️⃣ DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/glaemira")
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch((err) => console.log("DB Connection Error: ", err));

// 4️⃣ ROUTE MIDDLEWARES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes); 
app.use('/api/tickets', ticketRoutes);

// ==========================================
// 5️⃣ WEBSOCKETS (REAL-TIME PRIVATE CHAT)
// ==========================================

// 👉 FIX 3: SOCKET.IO KO BHI SAME CORS DO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// The Master Map: User ID (String) -> Socket ID
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Device Connected: ${socket.id}`);

  // 1. REGISTER: Jab bhi koi online aaye, uski exact String ID map me daalo
  socket.on('register_user', (userId) => {
    if(userId) {
      socket.userId = userId;
      userSocketMap.set(userId.toString(), socket.id);
      console.log(`👤 User Registered -> ID: ${userId} | Socket: ${socket.id}`);
    }
  });

  // 2. SEND MESSAGE
  socket.on('send_private_message', async (data) => {
    const { senderId, receiverId, text } = data;
    const actualSenderId = socket.userId || senderId; // Double protection

    if(!actualSenderId || !receiverId || !text) return;

    try {
      // Pehle DB me save karo (Original ID ke sath)
      const newMessage = new Message({ senderId: actualSenderId, receiverId, text });
      await newMessage.save();
      console.log(`📩 DB Saved: ${text} (From: ${actualSenderId} -> To: ${receiverId})`);

      // Receiver ko bhej do (Agar wo online hai)
      const receiverSocketId = userSocketMap.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_private_message', newMessage);
        console.log(`✅ Delivered to Receiver!`);
      } else {
        console.log(`💤 Receiver offline. Message saved in DB.`);
      }
      
      // Sender ko wapas screen pe dikhane ke liye bhejo
      socket.emit('message_sent_successfully', newMessage);
    } catch (error) {
      console.error("🚨 Chat DB Save Error:", error);
    }
  });

  // 3. DISCONNECT
  socket.on('disconnect', () => {
    if(socket.userId) {
      userSocketMap.delete(socket.userId.toString());
      console.log(`💤 User ${socket.userId} Disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`🚀 Server & Sockets running on port ${PORT}`));