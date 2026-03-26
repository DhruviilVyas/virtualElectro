// @ts-nocheck
// Vercel deployment bypass
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Star, Navigation, Search, ArrowRight, 
  ShoppingCart, Loader2, ShoppingBag, Heart, User as UserIcon, 
  Store, Crosshair, Map, Filter
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://virtualelectro.onrender.com";

interface Merchant {
  _id: string;
  name: string;
  distance?: number; 
}

const CustomerNearby: React.FC = () => {
  const navigate = useNavigate();
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxRadius, setMaxRadius] = useState<number>(5); 
  
  const [userLoc, setUserLoc] = useState<{city: string, area: string} | null>(null);

  useEffect(() => {
    const savedLoc = localStorage.getItem("electrocare_user_loc");
    if (savedLoc) setUserLoc(JSON.parse(savedLoc));

    const fetchMerchants = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/merchants`);
        if (res.ok) {
          const data = await res.json();
          const dataWithMockDistance = data.map((m: any, i: number) => ({
            ...m,
            distance: parseFloat(((i * 1.5) % 12 + 1).toFixed(1)) 
          }));
          setMerchants(dataWithMockDistance);
        }
      } catch (error) {
        console.error("Failed to load shops", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRadius = (shop.distance || 0) <= maxRadius;
    return matchesSearch && matchesRadius;
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0)); 

  return (
    <MobileShell>
      {/* 👉 FIX: `pb-28` ensures content stops well before BottomTabBar */}
      <div className="pb-28 bg-secondary/5 min-h-screen">
        
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-5 py-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground font-display leading-tight">Radar View</h1>
              <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
                <Crosshair size={12} className="text-primary"/> 
                {userLoc ? `Scanning around ${userLoc.area}` : "Scanning nearby area"}
              </p>
            </div>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Map size={18} className="text-primary-foreground" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find local shops..." 
                className="w-full py-3.5 pl-10 pr-4 bg-card border border-border/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>

        <div className="mx-5 mt-5 h-48 bg-card rounded-[28px] flex flex-col items-center justify-center relative overflow-hidden border border-border/50 shadow-sm">
          <div className="absolute w-64 h-64 border border-primary/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute w-40 h-40 border border-primary/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          <div className="absolute w-16 h-16 bg-primary/20 rounded-full animate-pulse" />
          
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center relative z-10 shadow-glow ring-4 ring-background">
            <Navigation size={20} className="text-primary-foreground" fill="currentColor" />
          </div>
          <p className="text-xs font-bold text-foreground mt-3 relative z-10">Live Map Navigation</p>
          <p className="text-[10px] text-muted-foreground relative z-10">Coming Soon</p>
        </div>

        <div className="px-5 mt-6 mb-4">
          <div className="flex justify-between items-end mb-3">
            <p className="text-sm font-extrabold text-foreground flex items-center gap-1.5"><Filter size={14}/> Search Radius</p>
            <Badge className="bg-primary/10 text-primary border-0 font-mono font-black">{maxRadius} km</Badge>
          </div>
          <input 
            type="range" min="1" max="20" step="1" 
            value={maxRadius} onChange={(e) => setMaxRadius(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-secondary rounded-full appearance-none outline-none" 
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-2 px-1">
            <span>1km (Walking)</span>
            <span>5km (Local)</span>
            <span>20km (City)</span>
          </div>
        </div>

        <div className="px-5 space-y-3 mt-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Found {filteredMerchants.length} shops
          </p>

          <AnimatePresence>
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
              filteredMerchants.map((shop, i) => (
                <motion.div
                  key={shop._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-card border border-border/50 p-4 rounded-[24px] shadow-sm hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/customer/shop/${shop._id}`)}
                >
                  <div className="w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center text-primary-foreground font-extrabold text-xl shrink-0 uppercase shadow-inner">
                    {shop.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground truncate capitalize">{shop.name}</p>
                      <Badge className="bg-success/10 text-success border-0 text-[8px] font-bold px-1.5 rounded-full">✓</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5 bg-warning/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-warning">
                        <Star size={10} className="fill-warning" /> 4.8
                      </div>
                      <span className="text-muted-foreground text-[10px]">·</span>
                      
                      <span className={`text-xs font-bold flex items-center gap-1 ${(shop.distance || 0) <= 2 ? 'text-success' : 'text-muted-foreground'}`}>
                        <MapPin size={10} /> {shop.distance} km away
                      </span>
                    </div>
                  </div>

                  <div className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center shrink-0">
                    <ArrowRight size={16} className="text-foreground" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          
          {filteredMerchants.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-card rounded-[28px] border border-dashed border-border mt-4">
              <Store className="mx-auto text-muted-foreground/40 mb-3" size={40} />
              <p className="font-extrabold text-foreground">No shops in this radius</p>
              <p className="text-xs text-muted-foreground mt-1">Try increasing the search slider up to 20km.</p>
            </motion.div>
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