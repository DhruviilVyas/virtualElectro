import React, { useState, useEffect, useRef } from "react";
import { User, ShoppingBag, MapPin, Badge, Heart, Settings, LogOut, ShoppingCart, ChevronRight, Package, CreditCard, HelpCircle, Wrench, Shield, Star, Camera, Loader2, Wallet } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MENU_ITEMS = [
  { icon: Package, label: "My Orders", desc: "Track your purchases", path: "/customer/orders",color: "bg-primary/10 text-primary" },
  { icon: Wallet, label: "My Passbook", desc: "View wallet transactions", path: "/customer/passbook", color: "bg-info/10 text-info" }, // 👈 Naya Menu Item
  { icon: Wrench, label: "Raise a Ticket", desc: "Request repair or installation", path: "/customer/raise-ticket", color: "bg-accent/10 text-accent" },
  { icon: Settings, label: "Settings", desc: "Notifications, privacy", color: "bg-muted text-muted-foreground" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs, contact us", color: "bg-success/10 text-success" },
];

const CustomerProfile: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 👉 Added walletBalance to the type
  const [userData, setUserData] = useState<{name: string, email: string, image?: string, walletBalance?: number} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      const token = localStorage.getItem("electrocare_token");
      if(!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) {
          const data = await res.json();
          setUserData(data);
          localStorage.setItem("electrocare_user", JSON.stringify(data)); 
        }
      } catch(e) {}
    }
    fetchFreshProfile();
  }, []);

  const displayName = userData?.name || "Guest User";
  const displayEmail = userData?.email || "guest@electrocare.com";
  const initial = displayName.charAt(0).toUpperCase();
  const balance = userData?.walletBalance || 0; // 👉 Wallet Balance nikal liya

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      const token = localStorage.getItem("electrocare_token");
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("http://localhost:5000/api/users/profile-pic", {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });

        if(res.ok) {
          const updatedUser = await res.json();
          setUserData(updatedUser);
          localStorage.setItem("electrocare_user", JSON.stringify(updatedUser));
          toast({ title: "Looking Good! 📸", description: "Profile picture updated." });
        } else {
          toast({ title: "Failed", description: "Could not upload image.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Server unreachable.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <MobileShell>
      <div className="pb-28">
        <div className="px-5 pt-6 pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 shadow-elevated relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div onClick={() => fileInputRef.current?.click()} className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-glow cursor-pointer group">
                {isUploading ? (
                   <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
                ) : userData?.image ? (
                   <img src={userData.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                   <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-3xl font-extrabold text-primary-foreground">{initial}</div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-background rounded-full flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform">
                  <Camera size={12} className="text-foreground" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleProfileImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-black text-foreground font-display capitalize">{displayName}</h1>
                <p className="text-xs text-muted-foreground font-medium">{displayEmail}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <Badge className="bg-success/15 text-success border-0 text-[9px] font-extrabold px-2 py-0.5 rounded-md"><Shield size={10} className="mr-1" /> Verified</Badge>
                  <Badge className="bg-warning/15 text-warning border-0 text-[9px] font-extrabold px-2 py-0.5 rounded-md"><Star size={10} className="mr-1 fill-warning" /> Premium</Badge>
                </div>
              </div>
            </div>

            {/* 👉 UPDATED STATS ROW: Showing Wallet Balance prominently */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/50 relative z-10">
              <div className="text-center">
                <p className="text-xl font-black font-mono text-foreground">12</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Orders</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="text-xl font-black font-mono text-foreground">3</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Wishlist</p>
              </div>
              <div className="text-center bg-primary/5 rounded-xl py-1">
                <p className="text-xl font-black font-mono text-primary">₹{balance.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-wider mt-0.5">Wallet Bal</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-5 space-y-2.5">
          {MENU_ITEMS.map((item, i) => (
            <motion.button key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => item.path && navigate(item.path)} className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border/40 hover:border-primary/20 active:scale-[0.98] transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color.split(" ")[0]} group-hover:scale-105 transition-transform`}><item.icon size={20} className={item.color.split(" ")[1]} /></div>
              <div className="flex-1 text-left"><p className="font-extrabold text-sm text-foreground">{item.label}</p><p className="text-[10px] font-medium text-muted-foreground mt-0.5">{item.desc}</p></div>
              <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}

          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} onClick={() => { localStorage.removeItem("electrocare_token"); localStorage.removeItem("electrocare_user"); logout(); navigate("/"); }} className="w-full flex items-center gap-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/10 mt-6 active:scale-[0.98] transition-transform">
            <div className="w-11 h-11 bg-destructive/10 rounded-xl flex items-center justify-center"><LogOut size={20} className="text-destructive" /></div>
            <p className="font-extrabold text-sm text-destructive">Log Out</p>
          </motion.button>
        </div>
      </div>
      <BottomTabBar items={[
        { label: "Home", icon: ShoppingBag, path: "/customer" },
        { label: "Wishlist", icon: Heart, path: "/customer/wishlist" },
        { label: "Nearby", icon: MapPin, path: "/customer/nearby" }, 
        { label: "Cart", icon: ShoppingCart, path: "/customer/cart" },
        { label: "Profile", icon: User, path: "/customer/profile" },
      ]} />
    </MobileShell>
  );
};

export default CustomerProfile;