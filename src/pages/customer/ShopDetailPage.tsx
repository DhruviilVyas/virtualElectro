import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft, Zap, Star, MapPin, Share2, Heart,
  ShoppingBag, Shield, Store, Truck, Award, MessageCircle,
  ShoppingCart, Loader2, User as UserIcon, Send, X
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const SHOP_FEATURES = [
  { icon: Shield, label: "Verified Seller", desc: "KYC & docs verified by ElectroCare" },
  { icon: Truck, label: "Free Delivery", desc: "On orders above ₹500" },
  { icon: Award, label: "Warranty Support", desc: "Official warranty on all products" },
  { icon: Zap, label: "Express Pickup", desc: "Ready in 30 mins for local orders" },
];

const ShopDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">("products");
  const [shop, setShop] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 REVIEWS STATE
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 👉 CHAT LOGIC STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen]);

  const fetchAllData = async () => {
    try {
      const [shopRes, productsRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/merchants/${id}`),
        fetch("http://localhost:5000/api/products"),
        fetch(`http://localhost:5000/api/users/merchants/${id}/reviews`) 
      ]);

      if (shopRes.ok) setShop(await shopRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (productsRes.ok) {
        const allProducts = await productsRes.json();
        if (Array.isArray(allProducts)) {
           setShopProducts(allProducts.filter((p: any) => String(p.merchantId) === String(id)));
        }
      }
    } catch (err) {
      console.error("Failed to load shop details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) return;

    const initSocket = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) {
          const userData = await res.json();
          setMyUserId(userData._id);

          socketRef.current = io("http://localhost:5000", { auth: { token: "TUMHARA_TOKEN" } })
          socketRef.current.emit("register_user", userData._id);

          socketRef.current.on("receive_private_message", (msg) => {
            if (msg.senderId === id) {
              setMessages(prev => [...prev, msg]);
            } else {
              toast({ title: "New Message", description: "You have a new message from another chat." });
            }
          });

          socketRef.current.on("message_sent_successfully", (msg) => {
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
  }, [id]);

  const openChat = async () => {
    setIsChatOpen(true);
    const token = localStorage.getItem("electrocare_token");
    if (!token) {
       toast({ title: "Login Required", description: "Please login to chat." });
       return setIsChatOpen(false);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
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
      text: currentMessage
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
      const res = await fetch(`http://localhost:5000/api/users/merchants/${id}/reviews`, {
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

  if (isLoading) return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32}/></div></MobileShell>;

  const safeShopName = shop?.name || "Unknown Shop";
  const shopInitial = safeShopName.charAt(0).toUpperCase();
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "New";

  return (
    <MobileShell>
      <div className="pb-28">
        {/* Banner */}
        <div className="relative h-52 gradient-primary overflow-hidden shadow-glow">
          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20 uppercase font-bold text-primary-foreground">{shopInitial}</div>
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
            <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-xl flex items-center justify-center"><ArrowLeft size={18}/></button>
            <div className="flex gap-2">
              <button className="w-10 h-10 glass rounded-xl flex items-center justify-center"><Share2 size={16}/></button>
              <button onClick={() => setLiked(!liked)} className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <Heart size={16} className={liked ? "text-destructive fill-destructive" : "text-foreground"} />
              </button>
            </div>
          </div>
        </div>

        {/* Shop Header */}
        <div className="px-5 -mt-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl font-bold text-primary-foreground uppercase shadow-glow">{shopInitial}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold truncate capitalize">{safeShopName}</h1>
                  <Badge className="bg-success/10 text-success border-0 text-[9px] px-2">✓ Verified</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-bold">
                  <span className="flex items-center gap-1 text-foreground"><Star size={13} className="text-warning fill-warning"/> {avgRating}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> Local Store</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 👉 FIXED ALIGNMENT: Floating Chat Button */}
        {/* Adjusted to bottom-[100px] to stay safely above BottomTabBar, added thick border & notification dot */}
        <button 
          onClick={openChat}
          className="fixed bottom-[100px] right-5 w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 border-2 border-background"
        >
          <MessageCircle size={24} />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-destructive border-2 border-background rounded-full"></span>
        </button>

        {/* Tabs Section */}
        <div className="px-5 mt-6">
          <div className="flex gap-1 glass rounded-2xl p-1">
            {(["products", "reviews", "about"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${activeTab === tab ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Rendering */}
        <div className="px-5 mt-4">
          <AnimatePresence mode="wait">
            
            {/* 📦 PRODUCTS TAB */}
            {activeTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                {shopProducts.map((p, i) => (
                  <div key={p._id} onClick={() => navigate(`/customer/product/${p._id}`)} className="glass rounded-2xl overflow-hidden shadow-elevated p-3 active:scale-[0.97] transition-all">
                    <div className="h-24 bg-secondary/50 rounded-xl mb-2 flex items-center justify-center text-3xl">
                      {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-xl" /> : "📦"}
                    </div>
                    <p className="font-bold text-xs truncate">{p.name}</p>
                    <p className="text-primary font-bold text-sm">₹{p.price?.toLocaleString()}</p>
                  </div>
                ))}
                {shopProducts.length === 0 && (
                  <p className="col-span-2 text-center text-muted-foreground py-10 text-sm">No products listed by this merchant yet.</p>
                )}
              </motion.div>
            )}

            {/* ⭐ REVIEWS TAB (RESTORED) */}
            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                
                {/* Average Score Header */}
                <div className="glass rounded-2xl p-4 shadow-elevated flex items-center gap-4">
                  <p className="text-4xl font-extrabold text-foreground font-mono">{avgRating}</p>
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.round(Number(avgRating)) ? "text-warning fill-warning" : "text-border fill-muted/20"} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
                  </div>
                </div>

                {/* Create Review Form */}
                <div className="glass rounded-2xl p-4 shadow-elevated border border-primary/20">
                  <p className="text-xs font-bold mb-2">Leave a Review</p>
                  <div className="flex gap-2 mb-3">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <button key={s} onClick={() => setNewReviewRating(s)}>
                         <Star size={20} className={s <= newReviewRating ? "text-warning fill-warning transition-colors" : "text-muted-foreground transition-colors"} />
                       </button>
                     ))}
                  </div>
                  <div className="relative">
                    <textarea 
                      value={newReviewText} 
                      onChange={(e) => setNewReviewText(e.target.value)} 
                      placeholder="Share your experience with this shop..." 
                      className="w-full bg-secondary/50 rounded-xl p-3 text-sm outline-none resize-none h-20 placeholder:text-muted-foreground"
                    />
                    <button 
                      onClick={submitReview}
                      disabled={isSubmittingReview || !newReviewText.trim()}
                      className="absolute bottom-2 right-2 w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-primary-foreground disabled:opacity-50 active:scale-95"
                    >
                      {isSubmittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-3 pt-2">
                  {reviews.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-4">Be the first to review this shop!</p>
                  ) : (
                    reviews.map((rev, i) => (
                      <motion.div key={rev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs uppercase shadow-glow">
                              {rev.customerName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground capitalize">{rev.customerName}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={10} className={s <= rev.rating ? "text-warning fill-warning" : "text-border"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-foreground mt-2 leading-relaxed opacity-90">{rev.text}</p>
                      </motion.div>
                    ))
                  )}
                </div>

              </motion.div>
            )}

            {/* ℹ️ ABOUT TAB (RESTORED) */}
            {activeTab === "about" && (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                 <div className="glass rounded-2xl p-4 space-y-3 shadow-elevated">
                   <h3 className="text-sm font-extrabold text-foreground font-display">About {safeShopName}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">Official merchant on ElectroCare. Contact us for bulk orders or local delivery.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   {SHOP_FEATURES.map((feat, i) => (
                     <div key={i} className="flex items-start gap-3 p-3 glass rounded-xl shadow-elevated">
                       <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shrink-0"><feat.icon size={12} className="text-primary-foreground" /></div>
                       <div><p className="text-[10px] font-bold text-foreground">{feat.label}</p></div>
                     </div>
                   ))}
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed inset-x-0 bottom-0 h-[80vh] bg-background z-50 rounded-t-3xl shadow-2xl flex flex-col border border-border"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">{shopInitial}</div>
                <div>
                  <p className="font-bold text-sm">{safeShopName}</p>
                  <p className="text-[10px] text-success">Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"><X size={16}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === myUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.senderId === myUserId ? 'gradient-primary text-primary-foreground rounded-tr-none' : 'bg-card border rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-card border-t flex gap-2">
              <input value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-secondary rounded-full px-4 py-3 text-sm outline-none" placeholder="Ask something..."/>
              <button onClick={handleSendMessage} className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-glow"><Send size={18}/></button>
            </div>
          </motion.div>
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