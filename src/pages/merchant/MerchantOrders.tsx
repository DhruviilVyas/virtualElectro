import React, { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Truck, CheckCircle2, Clock, Box, Phone, MapPin, Loader2, Tag, ExternalLink } from "lucide-react";
import { Order, OrderItem } from "@/types";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; nextBtn: string | null; nextStatus: string }> = {
  Processing: { icon: Clock, color: "bg-warning/10 text-warning border-warning/20", nextBtn: "Pack Order", nextStatus: "Packed" },
  Packed: { icon: Box, color: "bg-primary/10 text-primary border-primary/20", nextBtn: "Ship Order", nextStatus: "Shipped" },
  Shipped: { icon: Truck, color: "bg-accent/10 text-accent border-accent/20", nextBtn: "Mark Delivered", nextStatus: "Delivered" },
  Delivered: { icon: CheckCircle2, color: "bg-success/10 text-success border-success/20", nextBtn: null, nextStatus: "" },
};

const TABS = ["All", "Processing", "Packed", "Shipped", "Delivered"];

const MerchantOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) return navigate("/");

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 👉 BULLETPROOF FRONTEND PUT REQUEST
  const updateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("electrocare_token");
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "Shipped" && trackingNumber) {
         payload.trackingId = trackingNumber;
      }

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: "Order Updated! 🚀", description: `Order is now ${newStatus}` });
        setSelectedOrder(null);
        setTrackingNumber("");
        fetchOrders(); 
      } else {
         const errorData = await res.json();
         toast({ title: "Update Failed", description: errorData.error || "Could not update status.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Backend connection failed.", variant: "destructive" });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "All") return true;
    const rawStatus = order.status || 'Processing';
    let normalized = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    if (normalized === 'Pending') normalized = 'Processing';
    return normalized === activeTab;
  });

  return (
    <MobileShell>
      <div className="pb-24 bg-secondary/10 min-h-screen">
        
        <div className="bg-card px-5 pt-6 pb-4 border-b border-border sticky top-0 z-20">
          <h1 className="text-2xl font-extrabold text-foreground font-display">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders received</p>
          
          <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? "bg-foreground text-background shadow-md" 
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={40} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-bold text-foreground">No {activeTab !== "All" ? activeTab : ""} orders found</p>
              <p className="text-xs text-muted-foreground mt-1">When customers buy, orders will appear here.</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => {
              const rawStatus = order.status || 'Processing';
              let normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
              if (normalizedStatus === 'Pending') normalizedStatus = 'Processing';
              const cfg = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['Processing'];

              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card p-5 rounded-2xl shadow-sm border border-border">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">ORD-{order._id.slice(-6)}</p>
                      <h3 className="font-extrabold text-lg text-foreground mt-0.5 capitalize">{order.customerName || "Guest User"}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <Badge className={`text-[10px] font-bold uppercase rounded-full border px-2.5 py-1 ${cfg.color}`}>
                      {normalizedStatus}
                    </Badge>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-3.5 mb-4 border border-border/50">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground font-medium leading-relaxed">{order.shippingAddress || "Address not provided by user"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.products?.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-background border border-border/50 p-2.5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 bg-secondary rounded flex items-center justify-center font-bold text-primary shrink-0">{item.quantity}</span>
                          <span className="text-foreground font-medium truncate w-40">
                            {item.product?.name || order.productId?.name || "Product"}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground shrink-0">
                          ₹{(item.price || order.productId?.price || 0) * (item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Total Value</p>
                      <p className="text-xl font-mono font-black text-foreground">
                        ₹{order.totalAmount?.toLocaleString('en-IN') || order.total?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>

                    {cfg.nextBtn && (
                      <button 
                        onClick={() => {
                          if(cfg.nextStatus === "Shipped") setSelectedOrder(order._id);
                          else updateStatus(order._id, cfg.nextStatus);
                        }}
                        className="px-5 py-2.5 gradient-primary text-primary-foreground rounded-xl text-xs font-bold shadow-glow active:scale-95 transition-transform flex items-center gap-2"
                      >
                        <cfg.icon size={14} /> {cfg.nextBtn}
                      </button>
                    )}
                  </div>
                  
                  {normalizedStatus === "Shipped" && order.trackingId && (
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-accent" />
                        <p className="text-xs font-bold text-accent">Tracking: {order.trackingId}</p>
                      </div>
                      <ExternalLink size={14} className="text-accent" />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Truck size={24} className="text-accent" />
              </div>
              <h2 className="text-xl font-extrabold mb-1 text-foreground">Ship Order</h2>
              <p className="text-xs text-muted-foreground mb-5">Enter courier tracking number to notify the customer.</p>
              
              <input 
                autoFocus
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. Delhivery - 12345" 
                className="w-full p-4 bg-secondary rounded-xl text-sm outline-none border-2 border-transparent focus:border-primary transition-all mb-5"
              />
              
              <div className="flex gap-3">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3.5 bg-secondary text-foreground rounded-xl font-bold text-sm hover:bg-secondary/80">Cancel</button>
                <button 
                  disabled={!trackingNumber}
                  onClick={() => updateStatus(selectedOrder, "Shipped")} 
                  className="flex-1 py-3.5 gradient-primary text-primary-foreground rounded-xl font-bold text-sm shadow-glow disabled:opacity-50"
                >
                  Confirm Shipment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomTabBar items={[
        { label: "Dashboard", icon: LayoutDashboard, path: "/merchant" },
        { label: "Inventory", icon: Package, path: "/merchant/inventory" },
        { label: "Orders", icon: ShoppingBag, path: "/merchant/orders" },
        { label: "Offers", icon: Tag, path: "/merchant/offers" },
        { label: "Issues", icon: Phone, path: "/merchant/issues" }
      ]} />
    </MobileShell>
  );
}

export default MerchantOrders;