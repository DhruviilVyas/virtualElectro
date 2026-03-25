import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Heart, ShoppingCart, Minus, Plus, Store, Loader2
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 👉 Real Data States
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // 👉 Fetch Single Product from Backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          toast({ title: "Error", description: "Product not found", variant: "destructive" });
        }
      } catch (err) {
        console.error("Backend fetch failed");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProduct();
  }, [id]);

  const handleBuyNow = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id, 
          quantity: quantity
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast({ title: "Purchase Successful!", description: "Stock updated in database." });
        navigate("/customer"); 
      } else {
        toast({ title: "Checkout Failed", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Payment processing failed.", variant: "destructive" });
    }
  };

  // 👉 Pura Add to Cart Logic jo Database me save karega
  const handleAddToCart = async () => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) {
      toast({ title: "Error", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          productId: product._id, 
          quantity,
          action: "add" // Telling backend to ADD to existing quantity
        })
      });

      if (res.ok) {
        toast({ title: "Added to Cart", description: `${quantity}x ${product.name} added securely.` });
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Failed to update cart.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </MobileShell>
    );
  }

  if (!product) {
    return (
      <MobileShell>
        <div className="flex flex-col h-screen items-center justify-center p-5 text-center">
          <p className="text-muted-foreground mb-4">Product not found or removed.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">Go Back</button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="pb-32">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <button onClick={() => setWishlisted(!wishlisted)} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Heart size={18} className={wishlisted ? "text-destructive fill-destructive" : "text-foreground"} />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative bg-secondary">
          <div className="h-72 flex items-center justify-center text-8xl overflow-hidden">
             {product.image && (product.image.startsWith('http') || product.image.includes('ixlib=rb-')) ? (
               <img src={product.image.startsWith('http') ? product.image : `https://${product.image}`} alt={product.name} className="w-full h-full object-cover" />
             ) : (
               <span>{product.image || "📦"}</span>
             )}
          </div>
          {product.offer && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-[9px] px-3 py-1 rounded-full font-bold uppercase border-0">
              {product.offer}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-1">
            <Store size={12} className="text-muted-foreground" />
            {/* 👉 THE FIX: Binding Merchant Name directly from DB */}
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Sold by: <span className="text-primary">{product.shopName || "ElectroCare Verified"}</span>
            </p>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-warning fill-warning" />
              <span className="text-sm font-bold text-foreground">4.5</span>
            </div>
            <span className="text-xs text-muted-foreground">·</span>
            <span className={`text-xs font-medium ${product.stock > 0 ? "text-success" : "text-destructive"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold font-mono text-primary">${product.price}</span>
          </div>

          {/* Quantity Selector */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Quantity</span>
            <div className="flex items-center gap-3 bg-secondary rounded-xl p-1">
              <button 
                onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                className="w-9 h-9 bg-card rounded-lg flex items-center justify-center"
              >
                <Minus size={14} className="text-foreground" />
              </button>
              <span className="font-bold font-mono text-foreground w-6 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} 
                className="w-9 h-9 bg-card rounded-lg flex items-center justify-center"
              >
                <Plus size={14} className="text-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/95 backdrop-blur-xl border-t border-border px-5 py-4 flex gap-3 z-50">
        <button onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1 py-4 bg-foreground text-background rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          <ShoppingCart size={16} /> Add to Cart
        </button>
      <button 
  onClick={() => {
    // We send an array with ONE item directly to checkout!
    navigate("/customer/checkout", { 
      state: { 
        items: [{ ...product, cartQuantity: quantity }] 
      } 
    });
  }} 
  disabled={product.stock <= 0} 
  className="px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm"
>
  Buy Now
</button>
      </div>
    </MobileShell>
  );
};

export default ProductDetailPage;