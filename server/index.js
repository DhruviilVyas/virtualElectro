import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet'; // 👈 FIX 1: Import syntax used correctly

// 👉 CHAT SYSTEM IMPORTS (From previous step)
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

// 1️⃣ IMPORT ALL ROUTES HERE
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Chat history route
import jwt from 'jsonwebtoken';
import ticketRoutes from './routes/ticketRoutes.js';
const JWT_SECRET = process.env.JWT_SECRET || "electrocare_super_secret_key_2026";
dotenv.config();

const app = express(); // 👈 FIX 2: App pehle banega

// 👉 EXPRESS SERVER KO HTTP SERVER MEIN CONVERT KIYA (For Chat)
const httpServer = createServer(app);

// 2️⃣ SECURITY MIDDLEWARES
app.use(helmet()); // 👈 FIX 2: App banne ke baad helmet pehnaya

// 👈 FIX 3: Single, clean CORS policy
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

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
app.use('/api/chats', chatRoutes); // Chat history ke liye
app.use('/api/tickets', ticketRoutes);
// ==========================================
// 5️⃣ WEBSOCKETS (REAL-TIME PRIVATE CHAT)
// ==========================================
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST"]
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

// 👉 FIX: app.listen() nahi, ab httpServer.listen() chalega taaki Sockets bhi chalein!
httpServer.listen(PORT, () => console.log(`🚀 Server & Sockets running on http://localhost:${PORT}`));