// @ts-nocheck
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,ArrowRight, Search, MessageCircle, Phone, Mail, 
  ChevronDown, ChevronUp, Wrench, Package, CreditCard,
  ShoppingBag, Heart, MapPin, ShoppingCart, User as UserIcon
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";

const FAQS = [
  { id: 1, q: "How do I track my order?", a: "You can track your order in real-time by going to the 'Orders' section in your profile." },
  { id: 2, q: "What is the return policy?", a: "We offer a 7-day hassle-free return policy for all unused electronics in their original packaging." },
  { id: 3, q: "How do I book a repair technician?", a: "Click on 'Raise a Repair Ticket' below. It costs ₹500 from your wallet, and a verified technician will visit your location." },
  { id: 4, q: "My wallet balance is deducted but order failed.", a: "Don't worry! Any deducted amount for failed transactions is automatically refunded within 2-4 hours." },
];

const CustomerHelp: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <MobileShell>
      <div className="pb-28 bg-secondary/5 min-h-screen">
        
        {/* 👉 HEADER */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm px-5 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center justify-center transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground font-display tracking-tight">Help & Support</h1>
        </div>

        {/* 👉 HERO SEARCH */}
        <div className="px-5 mt-6 mb-8">
          <h2 className="text-2xl font-black font-display mb-2">How can we help you?</h2>
          <p className="text-sm text-muted-foreground mb-5">Search for articles or browse FAQs</p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 'Refunds', 'Tracking'..." 
              className="w-full py-4 pl-11 pr-4 bg-card border border-border/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 shadow-sm transition-all" 
            />
          </div>
        </div>

        {/* 👉 QUICK ACTIONS (Links to important flows) */}
        <div className="px-5 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate('/customer/orders')} className="flex flex-col items-center p-4 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-elevated transition-all active:scale-95">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2"><Package size={18}/></div>
              <span className="text-[10px] font-bold text-center">Track Order</span>
            </button>
            <button onClick={() => navigate('/customer/raise-ticket')} className="flex flex-col items-center p-4 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-elevated transition-all active:scale-95 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-warning/10 rounded-bl-full" />
              <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-2"><Wrench size={18}/></div>
              <span className="text-[10px] font-bold text-center">Repair Ticket</span>
            </button>
            <button onClick={() => navigate('/customer/passbook')} className="flex flex-col items-center p-4 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-elevated transition-all active:scale-95">
              <div className="w-10 h-10 bg-success/10 text-success rounded-full flex items-center justify-center mb-2"><CreditCard size={18}/></div>
              <span className="text-[10px] font-bold text-center">Wallet/Refund</span>
            </button>
          </div>
        </div>

        {/* 👉 FAQS ACCORDION */}
        <div className="px-5 mb-8">
          <h3 className="font-extrabold text-lg mb-4 font-display">Top Questions</h3>
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span className="font-bold text-sm text-foreground pr-4">{faq.q}</span>
                  {expandedId === faq.id ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>
                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {filteredFaqs.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">No FAQs match your search.</p>}
          </div>
        </div>

        {/* 👉 CONTACT SUPPORT */}
        <div className="px-5">
          <h3 className="font-extrabold text-lg mb-4 font-display">Still need help?</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-glow"><MessageCircle size={18}/></div>
                <div className="text-left">
                  <p className="font-bold text-sm text-foreground">Chat with us</p>
                  <p className="text-[10px] text-success font-medium">Online • Avg wait 2 mins</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground" />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-colors text-sm font-bold">
                <Phone size={16} className="text-primary"/> Call Us
              </button>
              <button className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-colors text-sm font-bold">
                <Mail size={16} className="text-primary"/> Email Us
              </button>
            </div>
          </div>
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

export default CustomerHelp;