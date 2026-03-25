import React, { useState, useEffect } from "react";
import { Order, OrderItem, Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck,
  ChevronRight, Loader2, ShoppingBag
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 👉 SECURE STATE
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 FETCH ORDERS FROM SECURE API
  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem("electrocare_token");
      if (!token) {
        toast({ title: "Error", description: "Please login to view orders." });
        navigate("/");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/orders/my-orders", {
          headers: { "Authorization": `Bearer ${token}` } // 👉 VIP PASS
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        toast({ title: "Network Error", description: "Failed to load orders.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle size={16} className="text-success" />;
      case "Shipped": return <Truck size={16} className="text-accent" />;
      case "Processing": return <Clock size={16} className="text-warning" />;
      default: return <Package size={16} className="text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-success/10 text-success border-success/20";
      case "Shipped": return "bg-accent/10 text-accent border-accent/20";
      case "Processing": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  if (isLoading) {
    return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></MobileShell>;
  }

  return (
    <MobileShell>
      <div className="pb-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-5 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground font-display">Order History</h1>
            <p className="text-xs text-muted-foreground">{orders.length} orders securely synced</p>
          </div>
        </div>

        <div className="px-5 mt-6 space-y-4">
          <AnimatePresence>
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-5 rounded-2xl shadow-elevated border border-border/50"
              >
                {/* Order Meta */}
                <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Order ID</p>
                    <p className="text-sm font-bold font-mono text-foreground mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{order.status}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.products.map((item: OrderItem, index: number) => {
                    const product = (item.product || {}) as Product; // Safe fallback with type
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {product.image && (product.image.startsWith('http') || product.image.includes('ixlib=rb-')) ? (
                            <img src={product.image.startsWith('http') ? product.image : `https://${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{product.image || "📦"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{product.name || "Unknown Item"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold font-mono text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Total & Action */}
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Paid</p>
                    <p className="text-lg font-extrabold font-mono text-foreground mt-0.5">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <button className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {orders.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">No orders yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">Looks like you haven&apos;t made any purchases securely yet.</p>
              <button onClick={() => navigate('/customer')} className="mt-6 px-6 py-3 gradient-primary text-primary-foreground rounded-xl font-bold text-sm shadow-glow">
                Start Exploring
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
};

export default CustomerOrders;