// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft, Zap, Star, MapPin, Share2, Heart,
  ShoppingBag, Shield, Store, Truck, Award, MessageCircle,
  ShoppingCart, Loader2, User as UserIcon, Send, X, MoreVertical
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://virtualelectro.onrender.com";

// Explicit Interfaces for Vercel
interface ProductType {
  _id: string;
  name: string;
  price: number;
  image?: string;
  merchantId: string;
}

interface ReviewType {
  _id: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface ShopType {
  _id: string;
  name: string;
}

interface MessageType {
  senderId: string;
  text: string;
}

const SHOP_FEATURES = [
  { icon: Shield, label: "Verified Seller", desc: "KYC & docs verified by ElectroCare" },
  { icon: Truck, label: "Free Delivery", desc: "On orders above ₹500" },
  { icon: Award, label: "Warranty Support", desc: "Official warranty on all products" },
  { icon: Zap, label: "Express Pickup", desc: "Ready in 30 mins for local orders" },
];

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">("products");
  const [shop, setShop] = useState<ShopType | null>(null);
  const [shopProducts, setShopProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(scrollToBottom, 100); // Slight delay ensures DOM is ready
    }
  }, [messages, isChatOpen]);

  const fetchAllData = async () => {
    try {
      const [shopRes, productsRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/merchants/${id}`),
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/users/merchants/${id}/reviews`)
      ]);

      if (shopRes.ok) setShop(await shopRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (productsRes.ok) {
        const allProducts = await productsRes.json();
        if (Array.isArray(allProducts)) {
          setShopProducts(allProducts.filter((p: ProductType) => String(p.merchantId) === String(id)));
        }
      }
    } catch (err) {
      console.error("Failed to load shop details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) return;

    const initSocket = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setMyUserId(userData._id);

          socketRef.current = io(API_BASE_URL, { auth: { token } });
          socketRef.current.emit("register_user", userData._id);

          socketRef.current.on("receive_private_message", (msg: MessageType) => {
            if (msg.senderId === id) {
              setMessages(prev => [...prev, msg]);
            } else {
              toast({ title: "New Message", description: "You have a new message from another chat." });
            }
          });

          socketRef.current.on("message_sent_successfully", (msg: MessageType) => {
            setMessages(prev => [...prev, msg]);
          });
        }
      } catch (error) {
        console.error("Socket Auth Error:", error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_private_message");
        socketRef.current.off("message_sent_successfully");
        socketRef.current.disconnect();
      }
    };
  }, [id, toast]);

  const openChat = async () => {
    setIsChatOpen(true);
    const token = localStorage.getItem("electrocare_token");
    if (!token) {
      toast({ title: "Login Required", description: "Please login to chat." });
      return setIsChatOpen(false);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (err) {
      console.error("History Load Error:", err);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !socketRef.current || !myUserId) return;

    const data = {
      senderId: myUserId,
      receiverId: id,
      text: currentMessage.trim()
    };

    socketRef.current.emit("send_private_message", data);
    setCurrentMessage("");
  };

  const submitReview = async () => {
    if (!newReviewText.trim()) {
      toast({ title: "Oops!", description: "Review text cannot be empty.", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem("electrocare_token");
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/merchants/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newReviewRating, text: newReviewText })
      });

      if (res.ok) {
        toast({ title: "Success", description: "Review posted!" });
        setNewReviewText("");
        fetchAllData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Connection failed.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></MobileShell>;

  const safeShopName = shop?.name || "Unknown Shop";
  const shopInitial = safeShopName.charAt(0).toUpperCase();
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "New";

  return (
    <MobileShell>
      <div className="pb-28 min-h-screen bg-background">
        {/* Banner */}
        <div className="relative h-52 gradient-primary overflow-hidden shadow-glow">
          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20 uppercase font-bold text-primary-foreground">{shopInitial}</div>
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
            <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18} /></button>
            <div className="flex gap-2">
              <button className="w-10 h-10 glass rounded-xl flex items-center justify-center"><Share2 size={16} /></button>
              <button onClick={() => setLiked(!liked)} className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <Heart size={16} className={liked ? "text-destructive fill-destructive" : "text-foreground"} />
              </button>
            </div>
          </div>
        </div>

        {/* Shop Header */}
        <div className="px-5 -mt-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[24px] p-5 shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl font-bold text-primary-foreground uppercase shadow-glow">{shopInitial}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold truncate capitalize">{safeShopName}</h1>
                  <Badge className="bg-success/10 text-success border-0 text-[9px] px-2 py-0.5 rounded-full">✓ Verified</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-bold">
                  <span className="flex items-center gap-1 text-foreground"><Star size={13} className="text-warning fill-warning" /> {avgRating}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> Local Store</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Chat Button */}
        <button
          onClick={openChat}
          className="fixed bottom-[90px] right-5 w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-glow hover:scale-105 active:scale-95 transition-all z-40"
        >
          <MessageCircle size={24} />
        </button>

        {/* Tabs Section */}
        <div className="px-5 mt-6">
          <div className="flex gap-1 bg-secondary/50 rounded-2xl p-1.5 border border-border/50">
            {(["products", "reviews", "about"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Rendering */}
        <div className="px-5 mt-4">
          <AnimatePresence mode="wait">
            {activeTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                {shopProducts.map((p) => (
                  <div key={p._id} onClick={() => navigate(`/customer/product/${p._id}`)} className="bg-card border border-border/50 rounded-[24px] overflow-hidden shadow-sm hover:shadow-elevated p-3 active:scale-[0.97] transition-all">
                    <div className="h-28 bg-secondary/30 rounded-[18px] mb-3 flex items-center justify-center text-3xl overflow-hidden relative">
                      {p.image ? <img src={p.image.startsWith('http') ? p.image : `https://${p.image}`} alt={p.name} className="w-full h-full object-cover" /> : "📦"}
                    </div>
                    <p className="font-bold text-xs truncate mb-1">{p.name}</p>
                    <p className="text-primary font-bold text-sm">₹{p.price?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
                {shopProducts.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-secondary/20 rounded-[28px] border border-dashed border-border/50 mt-2">
                     <ShoppingBag className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                     <p className="text-sm font-bold text-foreground">No Products Listed</p>
                     <p className="text-xs text-muted-foreground mt-1">This merchant hasn't added any products yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-card border border-border/50 rounded-[24px] p-5 shadow-sm flex items-center gap-5">
                  <p className="text-5xl font-black text-foreground font-mono leading-none tracking-tighter">{avgRating}</p>
                  <div>
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16} className={s <= Math.round(Number(avgRating)) ? "text-warning fill-warning" : "text-secondary fill-secondary"} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Based on {reviews.length} reviews</p>
                  </div>
                </div>

                <div className="bg-card border border-border/50 rounded-[24px] p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                  <p className="text-sm font-extrabold mb-3 font-display relative z-10">Write a Review</p>
                  <div className="flex gap-2 mb-4 relative z-10">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setNewReviewRating(s)} className="active:scale-90 transition-transform">
                        <Star size={24} className={s <= newReviewRating ? "text-warning fill-warning transition-colors" : "text-secondary fill-secondary transition-colors"} />
                      </button>
                    ))}
                  </div>
                  <div className="relative z-10">
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full bg-secondary/50 border border-border/50 rounded-2xl p-4 text-sm outline-none resize-none h-24 placeholder:text-muted-foreground focus:border-primary/50 transition-colors"
                    />
                    <button
                      onClick={submitReview}
                      disabled={isSubmittingReview || !newReviewText.trim()}
                      className="absolute bottom-3 right-3 w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground disabled:opacity-50 active:scale-95 shadow-glow transition-all"
                    >
                      {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {reviews.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground font-medium py-6">Be the first to review this shop!</p>
                  ) : (
                    reviews.map((rev, i) => (
                      <motion.div key={rev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border/50 rounded-[20px] p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-accent rounded-[14px] flex items-center justify-center text-primary-foreground font-black text-sm uppercase shadow-inner">
                              {rev.customerName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground capitalize leading-none">{rev.customerName}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                                {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 bg-warning/10 px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-bold text-warning mr-1">{rev.rating}</span>
                            <Star size={10} className="text-warning fill-warning" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{rev.text}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="bg-card border border-border/50 rounded-[24px] p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-foreground font-display mb-2">About {safeShopName}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Official merchant partner on ElectroCare. We specialize in providing high-quality electronics with local support and warranty.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_FEATURES.map((feat, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 bg-card border border-border/50 rounded-[20px] shadow-sm">
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm"><feat.icon size={18} className="text-primary-foreground" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">{feat.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* 👉 PREMIUM CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-foreground/20 z-[100] backdrop-blur-sm" 
              onClick={() => setIsChatOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[85vh] bg-background z-[100] rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.15)] flex flex-col border-t border-border overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 pt-5 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-primary rounded-[16px] flex items-center justify-center text-primary-foreground font-black text-lg shadow-glow relative">
                    {shopInitial}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-card rounded-full" />
                  </div>
                  <div>
                    <p className="font-extrabold text-base text-foreground font-display leading-tight">{safeShopName}</p>
                    <p className="text-[11px] font-bold text-success mt-0.5">Online usually replies instantly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-full transition-colors"><MoreVertical size={20} /></button>
                  <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 bg-secondary hover:bg-secondary/80 rounded-full flex items-center justify-center transition-colors"><X size={18} className="text-foreground" /></button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-secondary/10 relative">
                {/* Date Badge */}
                <div className="flex justify-center my-2">
                  <span className="bg-card border border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 rounded-full shadow-sm">Today</span>
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.senderId === myUserId;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`p-3.5 px-4 rounded-[20px] text-sm max-w-[80%] leading-relaxed shadow-sm ${
                          isMe 
                            ? 'gradient-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-card border border-border/50 text-foreground rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[9px] mt-1.5 font-medium flex items-center gap-1 ${isMe ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground justify-start'}`}>
                          Just now
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} className="h-2" />
              </div>

              {/* Chat Input Area (Floating Style) */}
              <div className="p-4 bg-background border-t border-border/50 shrink-0 pb-safe">
                <div className="flex items-end gap-2 bg-secondary/50 rounded-[24px] p-2 border border-border/50 focus-within:border-primary/50 focus-within:bg-card transition-all shadow-inner">
                  <textarea 
                    value={currentMessage} 
                    onChange={(e) => setCurrentMessage(e.target.value)} 
                    onKeyPress={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }} 
                    className="flex-1 bg-transparent rounded-2xl px-3 py-2.5 text-sm outline-none resize-none max-h-32 min-h-[44px] placeholder:text-muted-foreground leading-relaxed" 
                    placeholder="Type your message..." 
                    rows={1}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!currentMessage.trim()}
                    className="w-11 h-11 gradient-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-glow shrink-0 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

export default ShopDetailPage;