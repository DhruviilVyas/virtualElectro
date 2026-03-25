import React, { useState, useEffect } from "react";
import { Product, Merchant } from "@/types";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Search, Heart, ShoppingBag, User, ShoppingCart, 
  Truck, Star, ChevronRight, Bell, SlidersHorizontal, 
  Sparkles, TrendingUp, ArrowRight, Loader2, Store, Zap, ArrowUpDown, Navigation
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const CATEGORIES = [
  { label: "All", emoji: "✨" },
  { label: "Phones", emoji: "📱" },
  { label: "Laptops", emoji: "💻" },
  { label: "Audio", emoji: "🎧" },
  { label: "Tablets", emoji: "📟" },
  { label: "Gaming", emoji: "🎮" },
];

const QUICK_PRICES = [10000, 25000, 50000, 100000, 150000];

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // 👉 SMART STATES FOR FILTER & SEARCH
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(150000); 
  const [sortBy, setSortBy] = useState<"none" | "low" | "high">("none");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [realShops, setRealShops] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<{ city: string, area: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [productsRes, shopsRes] = await Promise.all([
          fetch("http://localhost:5000/api/products").catch(() => null),
          fetch("http://localhost:5000/api/users/merchants").catch(() => null)
        ]);

        if (productsRes && productsRes.ok) {
          const pData = await productsRes.json();
          setDbProducts(Array.isArray(pData) ? pData : []);
        }

        if (shopsRes && shopsRes.ok) {
          const sData = await shopsRes.json();
          setRealShops(Array.isArray(sData) ? sData : []);
        }
      } catch (err) {
        console.log("Backend connection failed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    const savedWishlist = JSON.parse(localStorage.getItem("electrocare_wishlist") || "[]");
    setWishlist(savedWishlist);
    const savedLoc = localStorage.getItem("electrocare_user_loc");
    if(savedLoc) setUserLocation(JSON.parse(savedLoc));
  }, []);

  // 👉 MASTER FILTERING & SORTING LOGIC
  const filteredProducts = dbProducts.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          (p.shopName && p.shopName.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesPrice = (p.price || 0) <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  if (sortBy === "low") filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "high") filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));

  const trendingProducts = filteredProducts.filter(p => p.offer);
  const displayProducts = debouncedSearch || selectedCategory !== "All" || sortBy !== "none" || maxPrice < 150000 
    ? filteredProducts 
    : (trendingProducts.length > 0 ? trendingProducts : filteredProducts.slice(0, 6));

  const toggleWishlist = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const stringId = String(id);
    setWishlist((prev) => {
      const updated = prev.includes(stringId) ? prev.filter((i) => i !== stringId) : [...prev, stringId];
      localStorage.setItem("electrocare_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  // 👉 LOCATION LOGIC (GPS)
  const fetchLiveLocation = () => {
    if (!navigator.geolocation) return toast({ title: "Error", description: "GPS not supported.", variant: "destructive" });
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=en`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.state_district || data.address.county || "Unknown City";
            const area = data.address.suburb || data.address.neighbourhood || data.address.residential || "Current Area";
            const locObj = { city, area };
            setUserLocation(locObj);
            localStorage.setItem("electrocare_user_loc", JSON.stringify(locObj));
            setShowLocationModal(false);
            toast({ title: "Location Updated", description: `Delivery set to ${area}` });
          }
        } catch (error) {
          toast({ title: "Network Error", description: "Failed to fetch area name.", variant: "destructive" });
        } finally { setIsLocating(false); }
      },
      () => { setIsLocating(false); toast({ title: "Permission Denied", description: "Please allow GPS.", variant: "destructive" }); }
    );
  };

  // 👉 LOCATION LOGIC (Manual)
  const handleManualLocation = (value: string) => {
    if (!value.trim()) return;
    const parts = value.split(',');
    const area = parts[0].trim();
    const city = parts.length > 1 ? parts[parts.length - 1].trim() : "City";
    
    const locObj = { city, area };
    setUserLocation(locObj);
    localStorage.setItem("electrocare_user_loc", JSON.stringify(locObj));
    setShowLocationModal(false);
    toast({ title: "Location Saved", description: `Delivery set to ${area}` });
  };

  return (
    <MobileShell>
      <div className="pb-28">
        
        {/* 👉 PREMIUM HEADER WITH BRANDING */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div className="px-5 pt-5 pb-4">
            
            <div className="flex justify-between items-center mb-5">
              {/* Logo & Branding */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow shrink-0">
                  <Zap size={20} className="text-primary-foreground" fill="currentColor" />
                  
                </div>
                <div>
                  <h1 className="text-xl font-extrabold font-display tracking-tight text-foreground leading-none">ElectroCare</h1>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Marketplace</p>
                </div>
              </div>

              {/* Notification Bell */}
              <button onClick={() => navigate('/customer/notifications')} className="w-10 h-10 bg-secondary/80 hover:bg-secondary rounded-xl flex items-center justify-center relative transition-colors border border-border/50">
                <Bell size={18} className="text-foreground" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full animate-pulse-dot ring-2 ring-background" />
              </button>
            </div>

            {/* Location & Search Bar Area */}
            <div className="space-y-3">
              {/* Elegant Location Selector */}
              <button onClick={() => setShowLocationModal(true)} className="w-full flex items-center justify-between p-3 bg-secondary/30 rounded-2xl border border-border/50 active:scale-[0.98] transition-transform text-left">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Delivering to</p>
                    <p className="font-extrabold text-sm text-foreground truncate">
                      {userLocation ? `${userLocation.area}, ${userLocation.city}` : "Select your delivery location"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>

              {/* Search + Filter */}
              <div className="relative flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search phones, laptops..."
                    className="w-full py-3.5 pl-11 pr-4 bg-card rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50 shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className="w-[52px] h-[52px] bg-card border border-border/50 rounded-2xl flex items-center justify-center active:scale-95 transition-transform relative shadow-sm hover:bg-secondary/50"
                >
                  <SlidersHorizontal size={18} className="text-foreground" />
                  {(maxPrice < 150000 || sortBy !== "none") && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        {!debouncedSearch && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-5 mt-6 p-6 gradient-accent rounded-3xl text-primary-foreground relative overflow-hidden shadow-elevated">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute -right-4 -bottom-10 w-24 h-24 bg-primary-foreground/5 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={14} className="text-warning" />
                <span className="text-[10px] font-black uppercase tracking-widest text-warning drop-shadow-md">Flash Sale</span>
              </div>
              <h3 className="text-2xl font-black font-display leading-tight">Up to 40% Off <br/> <span className="text-primary-foreground/80 text-lg">on Electronics</span></h3>
              <button 
                onClick={() => {
                  setSearchTerm(""); setSelectedCategory("All");
                  toast({ title: "Offers Applied", description: "Showing discounted products." });
                }} 
                className="mt-4 px-5 py-2.5 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-xl text-xs font-bold backdrop-blur-md flex items-center gap-2 transition-colors active:scale-95"
              >
                Explore Deals <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Real Nearby Shops */}
        {!debouncedSearch && (
          <div className="px-5 mt-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-extrabold text-foreground font-display">Fast Delivery Shops</h2>
              <button onClick={() => navigate("/customer/nearby")} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                View Map <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
              {isLoading ? (
                <div className="flex justify-center w-full py-4"><Loader2 className="animate-spin text-primary" /></div>
              ) : realShops.length > 0 ? (
                realShops.map((shop, i) => (
                  <motion.div key={shop._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => navigate(`/customer/shop/${shop._id}`)} className="min-w-[140px] p-4 bg-card border border-border rounded-3xl shadow-sm cursor-pointer active:scale-[0.97] transition-all hover:border-primary/30">
                    <div className="w-12 h-12 gradient-accent rounded-2xl mb-3 flex items-center justify-center text-xl shadow-inner border border-border/50 text-primary-foreground font-bold uppercase">
                      {shop.name ? shop.name.charAt(0) : <Store size={20} />}
                    </div>
                    <p className="font-extrabold text-sm text-foreground truncate capitalize">{shop.name || "Local Shop"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex items-center gap-0.5 bg-warning/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-warning">
                        <Star size={8} className="fill-warning" /> 4.5
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                        <Truck size={10} /> Fast
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-4">No shops found in your area yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="px-5 mt-4">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-3 -mx-5 px-5">
            {CATEGORIES.map((cat) => (
              <button key={cat.label} onClick={() => setSelectedCategory(cat.label)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${selectedCategory === cat.label ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-foreground hover:bg-secondary/50 shadow-sm"}`}>
                <span className="text-sm">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold text-foreground font-display flex items-center gap-2">
              {debouncedSearch || maxPrice < 150000 || sortBy !== "none" ? `Results (${displayProducts.length})` : <><TrendingUp size={18} className="text-primary" /> Top Picks</>}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card rounded-3xl border border-dashed border-border mt-4">
              <Search size={32} className="mx-auto opacity-20 mb-3" />
              <p className="text-sm font-bold text-foreground">No products found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {displayProducts.map((p, i) => {
                const productId = p._id || p.id; 
                return (
                  <motion.div key={productId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => navigate(`/customer/product/${productId}`)} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.97] transition-all hover:shadow-elevated hover:border-primary/30 group flex flex-col">
                    <div className="h-32 bg-secondary/30 flex items-center justify-center text-4xl relative overflow-hidden p-2">
                      {p.offer && (
                        <Badge className="absolute top-2 left-2 gradient-primary text-primary-foreground text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wide border-0 shadow-glow z-10">
                          {p.offer}
                        </Badge>
                      )}
                      <button onClick={(e) => toggleWishlist(productId, e)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10 transition-transform active:scale-75">
                        <Heart size={14} className={wishlist.includes(String(productId)) ? "text-destructive fill-destructive" : "text-muted-foreground"} />
                      </button>
                      
                      {p.image && (p.image.startsWith('http') || p.image.includes('ixlib=')) ? (
                        <img src={p.image.startsWith('http') ? p.image : `https://${p.image}`} alt={p.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{p.image || "📦"}</span>
                      )}
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1 truncate">
                        {p.shopName || p.shop || "TechZone"}
                      </p>
                      <p className="font-extrabold text-sm text-foreground line-clamp-2 leading-tight">{p.name}</p>
                      <div className="flex items-baseline gap-1.5 mt-auto pt-2">
                        <p className="text-primary font-mono font-black text-base">₹{p.price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 👉 PREMIUM LOCATION SELECTOR MODAL */}
      <AnimatePresence>
        {showLocationModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLocationModal(false)} className="fixed inset-0 bg-foreground/40 z-40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] z-50 border-t border-border shadow-[0_-20px_40px_rgba(0,0,0,0.15)] flex flex-col p-6">
              
              <div className="flex justify-center pb-4">
                <div className="w-12 h-1.5 bg-secondary rounded-full" />
              </div>
              
              <h3 className="text-xl font-extrabold font-display mb-2">Where to deliver?</h3>
              <p className="text-xs text-muted-foreground mb-6">Get accurate pricing and fast delivery options.</p>

              {/* Auto-Locate Button */}
              <button onClick={fetchLiveLocation} disabled={isLocating} className="w-full flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl active:scale-95 transition-transform mb-6">
                <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                  {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">Use Current Location</p>
                  <p className="text-[10px] text-primary/80 font-medium">Enable GPS for exact address</p>
                </div>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">or enter manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Manual Input Field */}
              <div className="relative mb-6">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  id="manual-loc-input"
                  placeholder="e.g. Navrangpura, Ahmedabad"
                  className="w-full py-4 pl-11 pr-4 bg-secondary/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:ring-2 ring-primary/20 transition-all border border-border/50 focus:border-primary/50 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualLocation(e.currentTarget.value);
                  }}
                />
              </div>

              <button onClick={() => {
                const val = (document.getElementById('manual-loc-input') as HTMLInputElement).value;
                if(val) handleManualLocation(val);
              }} className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-glow active:scale-95 transition-transform text-base">
                Confirm Location
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 👉 PREMIUM FILTER BOTTOM SHEET */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterModal(false)} className="fixed inset-0 bg-foreground/40 z-40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] z-50 border-t border-border shadow-[0_-20px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh]">
              
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-secondary rounded-full" />
              </div>

              <div className="px-6 pb-6 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold font-display">Filter & Sort</h3>
                  <button onClick={() => { setMaxPrice(150000); setSortBy("none"); setSelectedCategory("All"); }} className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                    Clear All
                  </button>
                </div>
                
                {/* Sort Section */}
                <div className="mb-8">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><ArrowUpDown size={14}/> Sort By Price</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setSortBy("low")} className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${sortBy === "low" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-secondary"}`}>
                      Low to High
                    </button>
                    <button onClick={() => setSortBy("high")} className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${sortBy === "high" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-secondary"}`}>
                      High to Low
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price Range</p>
                    <p className="font-mono font-black text-primary">Up to ₹{maxPrice.toLocaleString('en-IN')}</p>
                  </div>
                  
                  {/* Slider */}
                  <input 
                    type="range" min="0" max="150000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-full appearance-none outline-none mb-4" 
                  />
                  
                  {/* Quick Price Chips */}
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PRICES.map(price => (
                      <button 
                        key={price} onClick={() => setMaxPrice(price)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${maxPrice === price ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:bg-secondary"}`}
                      >
                        Under {price >= 100000 ? `${price/100000}L` : `${price/1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setShowFilterModal(false)} className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-glow active:scale-95 transition-transform text-lg">
                  Show {displayProducts.length} Results
                </button>
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
        { label: "Profile", icon: User, path: "/customer/profile" },
      ]} />
    </MobileShell>
  );
};

export default CustomerHome;