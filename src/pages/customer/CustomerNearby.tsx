import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Navigation, Search, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { ShoppingBag, Heart, User as UserIcon, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const CustomerNearby: React.FC = () => {
  const navigate = useNavigate();
  
  // 👉 NAYA: Real Merchants State
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/merchants");
        if (res.ok) {
          const data = await res.json();
          setMerchants(data);
        }
      } catch (error) {
        console.error("Failed to load shops");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  return (
    <MobileShell>
      <div className="pb-28">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-extrabold text-foreground font-display">Nearby Shops</h1>
          <p className="text-sm text-muted-foreground mt-1">{merchants.length} verified shops near you</p>
        </div>

        {/* Search */}
        <div className="px-5 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input placeholder="Search shops..." className="w-full py-3.5 pl-10 pr-4 glass rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:ring-2 ring-primary/20" />
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mx-5 h-44 gradient-accent rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden shadow-glow">
          <div className="absolute inset-0 bg-primary-foreground/5" />
          <div className="text-center text-primary-foreground relative z-10">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <Navigation size={22} />
            </div>
            <p className="text-xs font-bold">Interactive Map View</p>
          </div>
        </div>

        <div className="px-5 space-y-3">
          {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            merchants.map((shop, i) => (
              <motion.div
                key={shop._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 glass p-4 rounded-2xl shadow-elevated"
              >
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground font-extrabold text-xl shrink-0 uppercase shadow-glow">
                  {/* Shop ke naam ka pehla akshar */}
                  {shop.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground truncate capitalize">{shop.name}</p>
                    <Badge className="bg-success/10 text-success border-0 text-[8px] font-bold px-1.5 rounded-full">✓</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={11} className="text-warning fill-warning" />
                    <span className="text-xs text-muted-foreground font-semibold">4.8</span>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <MapPin size={11} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">1.2 miles</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/customer/shop/${shop._id}`)}
                  className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow shrink-0"
                >
                  <ArrowRight size={16} className="text-primary-foreground" />
                </button>
              </motion.div>
            ))
          )}
          
          {merchants.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <Store className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="font-bold">No shops found</p>
              <p className="text-xs text-muted-foreground">Ask merchants to register!</p>
            </div>
          )}
        </div>
      </div>
      <BottomTabBar items={[
        { label: "Home", icon: ShoppingBag, path: "/customer" },
        { label: "Wishlist", icon: Heart, path: "/customer/wishlist" },
        { label: "Nearby", icon: MapPin, path: "/customer/nearby" },
        { label: "Cart", icon: ShoppingCart, path: "/customer/cart" },
        { label: "Profile", icon: UserIcon, path: "/customer/profile" },
      ]} />
    </MobileShell>
  );
};

export default CustomerNearby;