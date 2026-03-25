import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { Heart, ShoppingBag, MapPin, User, Trash2, ShoppingCart, Loader2, Minus, Plus } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CustomerWishlist: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 Local quantities state to handle multiple items before adding to cart
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const fetchSecureWishlist = async () => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) return;

    try {
      const res = await fetch("https://virtualelectro.onrender.com/api/users/wishlist", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const validItems = data.filter(Boolean);
        setWishlistItems(validItems);
        
        // Initialize default quantity as 1 for all fetched items
        const initialQtys: Record<string, number> = {};
        validItems.forEach((p: Product) => { initialQtys[p._id] = 1; });
        setItemQuantities(initialQtys);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load wishlist", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecureWishlist();
  }, []);

  const handleQtyChange = (id: string, delta: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("electrocare_token");
    setWishlistItems(prev => prev.filter(p => p._id !== productId));

    try {
      await fetch("https://virtualelectro.onrender.com/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      toast({ title: "Removed", description: "Item removed from wishlist." });
    } catch (err) {
      fetchSecureWishlist();
    }
  };

  // 👉 SECURE ADD TO CART WITH SELECTED QUANTITY
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("electrocare_token");
    const quantity = itemQuantities[product._id] || 1;
    
    try {
      const res = await fetch("https://virtualelectro.onrender.com/api/users/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, quantity: quantity })
      });
      
      if (res.ok) {
        toast({ title: "Added to Cart", description: `${quantity}x ${product.name} moved to cart.` });
        // After adding to cart, remove from wishlist as per standard UX
        handleRemove(product._id, e);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not add to cart", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></MobileShell>;
  }

  return (
    <MobileShell>
      <div className="pb-28">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-extrabold text-foreground font-display">Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">{wishlistItems.length} items waiting for you</p>
        </div>

        <div className="px-5 space-y-3">
          <AnimatePresence>
            {wishlistItems.map((p, i) => {
              const productId = String(p._id);
              const currentQty = itemQuantities[productId] || 1;

              return (
                <motion.div
                  key={productId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-4 glass p-4 rounded-2xl shadow-elevated"
                >
                  <div 
                    onClick={() => navigate(`/customer/product/${productId}`)}
                    className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-2xl shrink-0 overflow-hidden cursor-pointer"
                  >
                    {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=rb-')) ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.image || "📦"}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{p.shop || "TechZone"}</p>
                    <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                    
                    {/* Quantity Selector inside Wishlist */}
                    <div className="flex items-center gap-3 mt-2">
                       <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleQtyChange(productId, -1); }} className="w-6 h-6 bg-card rounded flex items-center justify-center"><Minus size={10}/></button>
                          <span className="text-xs font-bold font-mono">{currentQty}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleQtyChange(productId, 1); }} className="w-6 h-6 bg-card rounded flex items-center justify-center"><Plus size={10}/></button>
                       </div>
                       <p className="text-primary font-mono font-bold text-xs">${(p.price * currentQty).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button onClick={(e) => handleAddToCart(p, e)} className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                      <ShoppingCart size={16} className="text-primary-foreground" />
                    </button>
                    <button onClick={(e) => handleRemove(productId, e)} className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {wishlistItems.length === 0 && (
          <div className="text-center mt-20 px-5">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={30} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground mt-2">Browse products and save them here.</p>
          </div>
        )}
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

export default CustomerWishlist;