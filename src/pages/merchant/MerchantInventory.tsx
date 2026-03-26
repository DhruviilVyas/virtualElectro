// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, LayoutDashboard, ShoppingBag, PlusCircle, Settings, X, Tag, Wrench, Loader2, ImagePlus, Box, Search, MoreVertical, Trash2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://virtualelectro.onrender.com";

interface ProductType {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  offer?: string;
  image?: string;
}

const MerchantInventory: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [offer, setOffer] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMyProducts = async () => {
    const token = localStorage.getItem("electrocare_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/my-inventory`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Could not fetch inventory.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setName(""); setPrice(""); setStock(""); setCategory(""); setOffer("");
    setImageFile(null); setImagePreview(null);
    setShowAdd(true);
  };

  const openEditForm = (product: ProductType) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategory(product.category || "");
    setOffer(product.offer || "");
    setImageFile(null);
    setImagePreview(product.image || null);
    setShowAdd(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async () => {
    if(!name || !price || !stock || !category) {
      toast({ title: "Incomplete Details", description: "Name, Price, Stock, and Category are required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("electrocare_token");
    const formData = new FormData();
    
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("offer", offer);
    if (imageFile) formData.append("image", imageFile);

    try {
      const endpoint = editingId 
        ? `${API_BASE_URL}/api/products/${editingId}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Success ✨", description: editingId ? "Product updated." : "New product added to catalog." });
        setShowAdd(false);
        fetchMyProducts(); 
      } else {
        const errorData = await res.json();
        toast({ title: "Failed", description: errorData.error || "Action failed.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Server Error", description: "Database is unreachable.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingId) return;
    setIsLoading(true);
    const token = localStorage.getItem("electrocare_token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${editingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast({ title: "Deleted", description: "Product removed permanently." });
        setShowAdd(false);
        fetchMyProducts();
      } else {
        toast({ title: "Error", description: "Could not delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Database connection failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <MobileShell>
      <div className="pb-28 bg-secondary/5 min-h-screen">
        
        {/* 👉 PREMIUM HEADER */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-5 py-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground font-display leading-none tracking-tight">Inventory</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} Listed
              </p>
            </div>
            <button onClick={openAddForm} className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow active:scale-95 transition-transform shrink-0">
              <PlusCircle size={20} className="text-primary-foreground" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your inventory..." 
              className="w-full py-3.5 pl-11 pr-4 bg-card border border-border/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 shadow-sm transition-all" 
            />
          </div>
        </div>

        <div className="px-5 mt-6 space-y-3">
          {isFetching ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <AnimatePresence>
              {filteredProducts.map((p, i) => (
                <motion.div 
                  key={p._id} 
                  layout
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-card p-3.5 rounded-[24px] border border-border/50 shadow-sm hover:shadow-elevated transition-all group"
                >
                  <div className="w-16 h-16 bg-secondary/50 rounded-[18px] flex items-center justify-center text-2xl overflow-hidden relative">
                    {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=')) ? (
                      <img src={p.image.startsWith('http') ? p.image : `https://${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl drop-shadow-sm">{p.image || "📦"}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <p className="font-extrabold text-sm text-foreground truncate pr-2">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 truncate">{p.category || 'Uncategorized'}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary font-mono font-black text-sm">₹{p.price?.toLocaleString()}</span>
                      <span className="text-muted-foreground text-[10px]">·</span>
                      <Badge className={`border-0 text-[9px] font-bold px-1.5 uppercase ${p.stock <= 0 ? "bg-destructive/10 text-destructive" : p.stock < 5 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </div>
                  
                  <button onClick={() => openEditForm(p)} className="w-10 h-10 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-xl flex items-center justify-center shrink-0 transition-colors active:scale-95">
                    <Settings size={16} className="text-foreground transition-colors" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* 👉 PREMIUM EMPTY STATE */}
          {products.length === 0 && !isFetching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card rounded-[32px] border border-dashed border-border shadow-sm mt-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box size={32} className="text-primary/60" />
              </div>
              <h3 className="font-extrabold text-lg text-foreground font-display">No Products Yet</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto leading-relaxed">
                Add your first electronic item to start selling to local customers.
              </p>
              <button onClick={openAddForm} className="mt-6 px-6 py-3 gradient-primary text-primary-foreground rounded-2xl font-bold text-xs shadow-glow active:scale-95 transition-transform flex items-center gap-2 mx-auto">
                <PlusCircle size={14}/> Add Product
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* 👉 PREMIUM ADD/EDIT MODAL (z-[100] for correct layering) */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-foreground/40 z-[100] backdrop-blur-sm" 
              onClick={() => !isLoading && setShowAdd(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              onClick={(e) => e.stopPropagation()} 
              className="fixed bottom-0 left-0 right-0 w-full bg-card rounded-t-[32px] p-6 space-y-5 max-h-[90vh] overflow-y-auto z-[100] shadow-[0_-20px_40px_rgba(0,0,0,0.15)] pb-10"
            >
              <div className="flex justify-center -mt-2 mb-2">
                <div className="w-12 h-1.5 bg-secondary rounded-full" />
              </div>

              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-extrabold text-foreground font-display">{editingId ? "Edit Details" : "New Product"}</h2>
                <button disabled={isLoading} onClick={() => setShowAdd(false)} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-secondary/80 transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* 👉 MODERN IMAGE UPLOAD UI */}
              <div className="flex justify-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-32 h-32 bg-secondary/30 rounded-[24px] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:bg-primary/5 hover:border-primary/60 transition-all shadow-sm"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings size={20} className="text-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <ImagePlus size={18} className="text-primary" />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Tap to Upload</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-3">
                <input disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Title (e.g. iPhone 15 Pro)" className="w-full py-4 pl-4 pr-4 bg-secondary/50 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50" />
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">₹</span>
                    <input disabled={isLoading} value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" className="w-full py-4 pl-8 pr-4 bg-secondary/50 rounded-2xl text-sm outline-none font-mono focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50" />
                  </div>
                  <input disabled={isLoading} value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock Qty" className="w-28 py-4 px-4 bg-secondary/50 rounded-2xl text-sm outline-none font-mono focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50 text-center" />
                </div>
                
                <select disabled={isLoading} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full py-4 px-4 bg-secondary/50 rounded-2xl text-sm outline-none text-foreground focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50 appearance-none">
                  <option value="" className="text-muted-foreground">Select Category</option>
                  <option value="Phones">Phones & Accessories</option>
                  <option value="Laptops">Laptops & Computers</option>
                  <option value="Audio">Audio & Headphones</option>
                  <option value="Tablets">Tablets & Wearables</option>
                  <option value="Gaming">Gaming & Consoles</option>
                </select>
                
                <input disabled={isLoading} value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Offer Tag (e.g. 20% OFF)" className="w-full py-4 px-4 bg-secondary/50 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button disabled={isLoading} onClick={handleSaveProduct} className="flex-1 py-4 gradient-primary text-primary-foreground rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex justify-center items-center gap-2 disabled:opacity-50 shadow-glow">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : editingId ? "Update Product" : "Publish to Store"}
                </button>
                {editingId && (
                   <button disabled={isLoading} onClick={handleDeleteProduct} className="w-14 h-14 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-2xl font-bold flex items-center justify-center shrink-0 active:scale-[0.98] transition-colors disabled:opacity-50 border border-destructive/20">
                     <Trash2 size={18} />
                   </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomTabBar items={[
        { label: "Dashboard", icon: LayoutDashboard, path: "/merchant" },
        { label: "Inventory", icon: Package, path: "/merchant/inventory" },
        { label: "Orders", icon: ShoppingBag, path: "/merchant/orders" },
        { label: "Offers", icon: Tag, path: "/merchant/offers" },
        { label: "Issues", icon: Wrench, path: "/merchant/issues" },
      ]} />
    </MobileShell>
  );
};

export default MerchantInventory;