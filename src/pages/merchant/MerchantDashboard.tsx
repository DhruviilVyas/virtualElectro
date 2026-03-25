import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client"; // 👈 Chat Socket Import kiya
import {
  LayoutDashboard, Package, ShoppingBag, AlertCircle,
  TrendingUp, Users, Eye, ArrowUpRight, ArrowDownRight,
  Tag, Wrench, BarChart3, Settings, ChevronRight, Star,
  Sparkles, Calendar, LogOut, MessageCircle,Wallet, // 👈 MessageCircle icon
  ArrowRight
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { MOCK_PRODUCTS, MOCK_ORDERS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast"; // 👈 Toast for alert

const QUICK_ACTIONS = [
  { icon: Package, label: "Add Product", gradient: "gradient-primary" },
  { icon: Tag, label: "New Offer", gradient: "gradient-accent" },
  { icon: BarChart3, label: "Analytics", gradient: "gradient-primary" },
  { icon: Settings, label: "Settings", gradient: "gradient-accent" },
];

const MerchantDashboard: React.FC = () => {
  const [isVerified] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const shopName = user?.name ? `${user.name}'s Store` : "My Store";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "M";

  const handleLogout = () => {
    logout(); 
    navigate("/"); 
  };

 
  const [totalRevenue, setTotalRevenue] = useState(0);
const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0); // 👉 Naya state add kiya
  // 👉 CHAT NOTIFICATION STATE
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // 👉 1. SOCKET LISTENER (For Real-Time Notifications)
  // 👉 1. SOCKET LISTENER (FIXED: Added JWT Auth Token)
  useEffect(() => {
    const token = localStorage.getItem("electrocare_token");
    if (!user?._id || !token) return;

    // Connect to WebSockets WITH TOKEN
    socketRef.current = io("http://localhost:5000", {
      auth: { token } // 👈 Yahan token bhejna zaroori tha!
    });
    
    socketRef.current.emit("register_user", user._id);

    // Listen for incoming customer messages
    socketRef.current.on("receive_private_message", (msg) => {
      setHasUnreadMessages(true); // Red dot on kardo
      toast({ 
        title: "New Customer Message! 📩", 
        description: "Tap the inbox icon to reply.",
        variant: "default"
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, toast]);

  // 👉 2. DATA FETCHING (FIXED: Added Auth Header to Orders)
 useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("electrocare_token");
      if (!token) return;

      try {
        const [resOrders, resProducts, resMe] = await Promise.all([
          fetch("http://localhost:5000/api/orders", { headers: { "Authorization": `Bearer ${token}` } }), 
          fetch("http://localhost:5000/api/products/my-inventory", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } }) // 👈 Wallet balance lane ke liye
        ]);

        if (resOrders.ok) setDbOrders(await resOrders.json());
        if (resProducts.ok) setDbProducts(await resProducts.json());
        if (resMe.ok) {
          const meData = await resMe.json();
          setWalletBalance(meData.walletBalance || 0); // 👉 Balance set kiya
        }
      } catch (err) {
        console.log("Backend offline or error.");
      }
    };
    fetchDashboardData();
  }, []);
  const displayOrders = dbOrders.length > 0 ? dbOrders : MOCK_ORDERS;
  const displayProducts = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;
  const displayRevenue = dbOrders.length > 0 ? totalRevenue : 28900;
  const displayOrderCount = dbOrders.length > 0 ? dbOrders.length : 187;

  const stats = [
    { label: "Live Traffic", value: "34", icon: Eye, change: "-2%", up: false, color: "bg-warning/10 text-warning" },
    { label: "Customers", value: "1,204", icon: Users, change: "+3%", up: true, color: "bg-success/10 text-success" },
  ];

  return (
    <MobileShell>
      <div className="pb-28">
        {/* Header */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles size={12} className="text-primary" /> Good Morning
              </p>
              <h1 className="text-2xl font-extrabold text-foreground mt-0.5 font-display capitalize">{shopName}</h1>
            </div>
            <div className="flex gap-2">
              
              {/* 👉 MERCHANT INBOX BUTTON */}
           <button 
  onClick={() => {
    setHasUnreadMessages(false);
    navigate("/merchant/inbox"); // 👈 Ye path App.tsx se match hona chahiye
  }}
  className="w-10 h-10 glass rounded-xl flex items-center justify-center relative"
>
  <MessageCircle size={18} className="text-foreground" />
  {hasUnreadMessages && (
    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
  )}
</button>

              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-glow uppercase">
                {initial}
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ... Rest of the UI remains exactly the same ... */}
        
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-5 mt-4 bg-warning/10 border border-warning/20 p-5 rounded-2xl"
          >
            <AlertCircle className="text-warning mb-2" size={22} />
            <h3 className="font-bold text-foreground font-display">Verification Pending</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our admins are reviewing your documents. You'll be live within 24 hours.
            </p>
          </motion.div>
        )}

        {/* 👉 UPDATED: MAIN WALLET BALANCE CARD FOR MERCHANT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mt-5 p-6 gradient-primary rounded-3xl text-primary-foreground relative overflow-hidden shadow-glow"
        >
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-primary-foreground/10 rounded-full" />
          <div className="absolute -right-4 -bottom-12 w-28 h-28 bg-primary-foreground/5 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-primary-foreground/90" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground/90">Available Wallet Balance</span>
              </div>
              <div className="bg-primary-foreground/20 rounded-full px-3 py-1 backdrop-blur-sm cursor-pointer active:scale-95 transition-transform">
                <span className="text-[10px] font-extrabold uppercase flex items-center gap-1">
                  Withdraw <ArrowRight size={10}/>
                </span>
              </div>
            </div>
            
            {/* 👉 SHOWING EXACT DB WALLET BALANCE */}
            <p className="text-5xl font-black font-mono tracking-tight drop-shadow-md">₹{walletBalance.toLocaleString('en-IN')}</p>
            
            <div className="flex gap-6 mt-6 pt-5 border-t border-primary-foreground/20">
              <div>
                <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-extrabold mb-1">Total Orders</p>
                <p className="text-lg font-black font-mono">{dbOrders.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-extrabold mb-1">Total Products</p>
                <p className="text-lg font-black font-mono">{dbProducts.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Stats Grid */}
        <div className="px-5 grid grid-cols-2 gap-3 mt-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass p-4 rounded-2xl shadow-elevated"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color.split(" ")[0]}`}>
                  <stat.icon size={16} className={stat.color.split(" ")[1]} />
                </div>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold">{stat.label}</p>
              <p className="text-xl font-extrabold font-mono text-foreground mt-0.5">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-6">
          <h2 className="text-base font-extrabold text-foreground mb-3 font-display">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex flex-col items-center gap-2 py-4 glass rounded-2xl shadow-elevated active:scale-95 transition-transform"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.gradient} shadow-glow`}>
                  <action.icon size={18} className="text-primary-foreground" />
                </div>
                <span className="text-[10px] font-bold text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="px-5 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-foreground font-display">Recent Orders</h2>
            <button className="flex items-center gap-1 text-xs font-bold text-primary">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {displayOrders.slice(0, 4).map((order: any, i: number) => {
              const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : order.id;
              const productName = typeof order.productId === 'object' && order.productId !== null 
                                  ? order.productId.name 
                                  : (order.product || "Unknown Product");

              return (
                <motion.div
                  key={order._id || order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-3 glass p-3.5 rounded-2xl shadow-elevated"
                >
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                    <Package size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{productName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{order.customer}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground font-mono">#{orderId}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-bold font-mono text-foreground">₹{order.total}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[8px] font-bold uppercase rounded-full px-2 ${
                        order.status === "pending" ? "bg-warning/10 text-warning border-0" :
                        order.status === "packed" ? "bg-primary/10 text-primary border-0" :
                        order.status === "shipped" ? "bg-accent/10 text-accent border-0" :
                        "bg-success/10 text-success border-0"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="px-5 mt-6">
          <h2 className="text-base font-extrabold text-foreground mb-3 font-display flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Top Selling
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {displayProducts.slice(0, 4).map((p: any, i: number) => (
              <motion.div
                key={p._id || p.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="min-w-[130px] glass rounded-2xl overflow-hidden shadow-elevated shrink-0"
              >
                <div className="h-20 bg-secondary/50 flex items-center justify-center text-2xl overflow-hidden">
                  {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=rb-')) ? (
                    <img 
                      src={p.image.startsWith('http') ? p.image : `https://${p.image}`} 
                      alt={p.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                  ) : (
                    <span className="text-4xl">{p.image || "📦"}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-xs font-bold font-mono text-primary mt-0.5">₹{p.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar items={[
        { label: "Dashboard", icon: LayoutDashboard, path: "/merchant" },
        { label: "Inventory", icon: Package, path: "/merchant/inventory" },
        { label: "Orders", icon: ShoppingBag, path: "/merchant/orders" },
        { label: "Offers", icon: Tag, path: "/merchant/offers" },
        { label: "Issues", icon: Wrench, path: "/merchant/issues" },
      ]} />
    </MobileShell>
  );
};

export default MerchantDashboard;