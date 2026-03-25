import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Clock, Phone, Share2, Heart,
  ShoppingBag, Shield, Truck, Award, MessageCircle,
  Percent, Headphones, ShoppingCart, Zap, ArrowRight, Loader2, User as UserIcon
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";

const SHOP_FEATURES = [
  { icon: Shield, label: "Verified Seller", desc: "KYC & docs verified by ElectroCare" },
  { icon: Truck, label: "Free Delivery", desc: "On orders above $50" },
  { icon: Award, label: "Warranty Support", desc: "Official warranty on all products" },
  { icon: Zap, label: "Express Pickup", desc: "Ready in 30 mins for local orders" },
];

const ShopDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">("products");

  // 👉 DYNAMIC STATES
  const [shop, setShop] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        // Fetch Merchant Details & All Products in parallel
        const [shopRes, productsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/merchants/${id}`),
          fetch("http://localhost:5000/api/products")
        ]);

        if (shopRes.ok) {
          const shopData = await shopRes.json();
          setShop(shopData);
        }
        
        if (productsRes.ok) {
          const allProducts = await productsRes.json();
          // 🔥 FILTER: Sirf is shop/merchant ke products dikhao
          const filtered = allProducts.filter((p: any) => p.merchantId === id);
          setShopProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load shop details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchShopAndProducts();
  }, [id]);

  if (isLoading) {
    return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32}/></div></MobileShell>;
  }

  if (!shop) {
    return <MobileShell><div className="flex h-screen items-center justify-center font-bold">Shop Not Found</div></MobileShell>;
  }

  return (
    <MobileShell>
      <div className="pb-28">
        {/* Hero Banner */}
        <div className="relative h-52 gradient-primary overflow-hidden shadow-glow">
          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20 uppercase font-bold text-primary-foreground">
            {shop.name.charAt(0)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
            <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div className="flex gap-2">
              <button className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <Share2 size={16} className="text-foreground" />
              </button>
              <button onClick={() => setLiked(!liked)} className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <Heart size={16} className={liked ? "text-destructive fill-destructive" : "text-foreground"} />
              </button>
            </div>
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="px-5 -mt-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl font-bold text-primary-foreground shrink-0 uppercase shadow-glow">
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground truncate font-display capitalize">{shop.name}</h1>
                  <Badge className="bg-success/10 text-success border-0 text-[9px] font-bold px-2 rounded-full">✓ Verified</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-warning fill-warning" />
                    <span className="text-sm font-bold text-foreground">4.8</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Local Store</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[ { icon: Phone, label: "Call" }, { icon: MessageCircle, label: "Chat" }, { icon: MapPin, label: "Directions" } ].map((action) => (
                <button key={action.label} className="flex flex-col items-center gap-1.5 py-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                  <action.icon size={16} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-6">
          <div className="flex gap-1 glass rounded-2xl p-1">
            {(["products", "reviews", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 mt-4">
              {shopProducts.length === 0 ? (
                 <p className="text-center text-muted-foreground py-10 text-sm">No products listed by this merchant yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {shopProducts.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/customer/product/${p._id}`)}
                      className="glass rounded-2xl overflow-hidden shadow-elevated cursor-pointer active:scale-[0.97] transition-transform"
                    >
                      <div className="h-24 bg-secondary/50 flex items-center justify-center text-3xl relative">
                        {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=rb-')) ? (
                          <img src={p.image.startsWith('http') ? p.image : `https://${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{p.image || "📦"}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-xs text-foreground truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-primary font-mono font-bold text-sm">${p.price}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 mt-4 space-y-3">
               <div className="glass rounded-2xl p-4 space-y-3 shadow-elevated">
                 <h3 className="text-sm font-extrabold text-foreground font-display">About {shop.name}</h3>
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