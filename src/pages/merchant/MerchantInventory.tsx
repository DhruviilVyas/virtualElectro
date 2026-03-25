import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, LayoutDashboard, ShoppingBag, PlusCircle, Settings, X, Search, Tag, Wrench, Loader2, ImagePlus } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { useToast } from "@/hooks/use-toast";

const MerchantInventory: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [offer, setOffer] = useState("");
  
  // 👉 NAYE IMAGE STATES
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMyProducts = async () => {
    const token = localStorage.getItem("electrocare_token");
    try {
      const res = await fetch("http://localhost:5000/api/products/my-inventory", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not connect to Database.", variant: "destructive" });
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

  const openEditForm = (product: any) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategory(product.category || "");
    setOffer(product.offer || "");
    setImageFile(null);
    setImagePreview(product.image || null); // Pehle ki photo dikhao
    setShowAdd(true);
  };

  // 👉 IMAGE SELECTION HANDLER
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Photo ka temporary preview dikhane ke liye
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 👉 SECURE SAVE WITH CLOUDINARY (FormData)
  const handleSaveProduct = async () => {
    if(!name || !price || !stock || !category) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("electrocare_token");

    // 👉 FormData use karenge photo bhejne ke liye
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("offer", offer);
    if (imageFile) {
      formData.append("image", imageFile); // 'image' naam se backend mein multer ko milegi
    }

    try {
      const endpoint = editingId 
        ? `http://localhost:5000/api/products/${editingId}`
        : `http://localhost:5000/api/products`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`
          // DHYAN RAHE: FormData ke sath 'Content-Type': 'application/json' NAHI lagate. Browser khud boundary set karta hai.
        },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Success", description: editingId ? "Updated with Image!" : "Saved to DB securely!" });
        setShowAdd(false);
        fetchMyProducts(); 
      } else {
        const errorData = await res.json();
        toast({ title: "Denied", description: errorData.error || "Action failed.", variant: "destructive" });
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
      const res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast({ title: "Deleted", description: "Permanently removed from DB." });
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

  return (
    <MobileShell>
      <div className="pb-24">
        {/* ... Header and Inventory List (No changes here, they are perfect) ... */}
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{products.length} products</p>
          </div>
          <button onClick={openAddForm} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-glow">
            <PlusCircle size={14} /> Add
          </button>
        </div>

        <div className="px-5 space-y-3">
          {isFetching ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            products.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                  {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=rb-')) ? (
                    <img src={p.image.startsWith('http') ? p.image : `https://${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{p.image || "📦"}</span>
                  )}              
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-mono font-bold text-sm">₹{p.price?.toLocaleString()}</span>
                    <span className={`text-[10px] font-medium ${p.stock <= 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
                <button onClick={() => openEditForm(p)} className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 shrink-0">
                  <Settings size={14} className="text-muted-foreground" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center backdrop-blur-sm" onClick={() => !isLoading && setShowAdd(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] bg-card rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Product" : "Add Product"}</h2>
                <button disabled={isLoading} onClick={() => setShowAdd(false)} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center disabled:opacity-50">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* 👉 IMAGE UPLOAD UI */}
              <div className="flex justify-center">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-32 h-32 bg-secondary rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-primary/50 transition-colors"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings size={20} className="text-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={28} className="text-muted-foreground mb-2" />
                      <p className="text-[10px] text-muted-foreground font-bold">Tap to Upload</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                />
              </div>

              <input disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full p-4 bg-secondary rounded-xl text-sm outline-none" />
              <div className="flex gap-3">
                <input disabled={isLoading} value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" className="flex-1 p-4 bg-secondary rounded-xl text-sm outline-none" />
                <input disabled={isLoading} value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock" className="w-24 p-4 bg-secondary rounded-xl text-sm outline-none" />
              </div>
              <select disabled={isLoading} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-secondary rounded-xl text-sm outline-none text-muted-foreground">
                <option value="">Select Category</option>
                <option value="Phones">Phones</option>
                <option value="Laptops">Laptops</option>
                <option value="Audio">Audio</option>
                <option value="Tablets">Tablets</option>
                <option value="Gaming">Gaming</option>
              </select>
              <input disabled={isLoading} value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Offer Tag (Optional)" className="w-full p-4 bg-secondary rounded-xl text-sm outline-none" />
              
              <div className="flex gap-2 pt-2">
                <button disabled={isLoading} onClick={handleSaveProduct} className="flex-1 py-10 bg-foreground text-background rounded-xl font-bold text-sm active:scale-[0.98] transition-transform flex justify-center items-center gap-2 disabled:opacity-50">
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
                {editingId && (
                   <button disabled={isLoading} onClick={handleDeleteProduct} className="px-6 py-10 bg-destructive/10 text-destructive rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50">
                     Delete
                   </button>
                )}
              </div>
            </motion.div>
          </motion.div>
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