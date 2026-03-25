import React, { useState, useEffect } from "react";
import { CartItem, Address, Product } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Package, Wallet, Check, ChevronRight, Plus, 
  ShieldCheck, Loader2, Navigation, Home, Briefcase, Zap, AlertCircle
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Only showing Wallet as we are using virtual economy
const PAYMENT_METHODS = [
  { id: "wallet", label: "ElectroCare Wallet", icon: Wallet, desc: "Instant & Zero Fee checkout" }
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  const [selectedPayment, setSelectedPayment] = useState("wallet");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  // 👉 THE MAGIC LOGIC: Auto-fill address when Add Form opens
  useEffect(() => {
    if (showAddForm && !newAddress) {
      const savedLoc = localStorage.getItem("electrocare_user_loc");
      if (savedLoc) {
        try {
          const { area, city } = JSON.parse(savedLoc);
          // Set text exactly how it looks in real apps
          setNewAddress(`${area}, ${city}\n\nFlat/House No: `);
        } catch(e) { /* ignore */ }
      }
    }
  }, [showAddForm]);

  const fetchInitialData = async () => {
    const token = localStorage.getItem("electrocare_token");
    if (!token) return navigate("/");
    
    try {
      if (location.state && location.state.items) setCartItems(location.state.items);
      else {
        const cartRes = await fetch("https://virtualelectro.onrender.com/api/users/cart", { headers: { "Authorization": `Bearer ${token}` }});
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData.map((i: {product: Product, quantity: number}) => ({ ...i.product, cartQuantity: i.quantity })).filter(Boolean));
        }
      }

      const addrRes = await fetch("https://virtualelectro.onrender.com/api/users/addresses", { headers: { "Authorization": `Bearer ${token}` }});
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
        const defaultAddr = addrData.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        else if (addrData.length > 0) setSelectedAddressId(addrData[0]._id);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast({ title: "Error", description: "GPS not supported.", variant: "destructive" });
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=en`);
          const data = await res.json();
          if (data && data.display_name) {
            setNewAddress(`${data.display_name}\n\nFlat/House No: `);
            if (!newLabel) setNewLabel("Home");
          } 
        } catch (error) { toast({ title: "Network Error", description: "Could not fetch exact street.", variant: "destructive" }); } 
        finally { setIsLocating(false); }
      },
      () => { setIsLocating(false); toast({ title: "Denied", description: "Enable GPS.", variant: "destructive" }); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAddress = async () => {
    if (!newLabel || !newAddress) return toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
    setIsProcessing(true);
    try {
      const res = await fetch("https://virtualelectro.onrender.com/api/users/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("electrocare_token")}` },
        body: JSON.stringify({ label: newLabel, address: newAddress, isDefault: addresses.length === 0 })
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        setNewLabel(""); setNewAddress(""); setShowAddForm(false);
        const latest = data.addresses[data.addresses.length - 1];
        if(latest) setSelectedAddressId(latest._id);
      }
    } catch (err) { toast({ title: "Error", description: "Save failed.", variant: "destructive" }); } 
    finally { setIsProcessing(false); }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.cartQuantity || 1)), 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) return toast({ title: "Error", description: "Add an address first.", variant: "destructive" });
    const finalAddress = addresses.find(a => a._id === selectedAddressId)?.address || addresses[0].address;
    
    setIsProcessing(true);
    const orderItems = cartItems.map(item => ({
      productId: item._id, quantity: item.cartQuantity || 1, price: item.price || 0,
      merchantId: item.merchantId, shopName: item.shopName || "ElectroCare"
    }));

    try {
      const res = await fetch("https://virtualelectro.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("electrocare_token")}` },
        body: JSON.stringify({ items: orderItems, totalAmount: total, shippingAddress: finalAddress })
      });
      const data = await res.json();
      if (res.ok) setOrderPlaced(true);
      else toast({ title: "Failed", description: data.error || "Something went wrong.", variant: "destructive" });
    } catch (err) { toast({ title: "Error", description: "Server Unreachable.", variant: "destructive" }); } 
    finally { setIsProcessing(false); }
  };

  const steps = ["Address", "Payment", "Confirm"];
  const stepIndex = steps.indexOf(step.charAt(0).toUpperCase() + step.slice(1));

  if (isLoading) return <MobileShell><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></MobileShell>;

  if (orderPlaced) {
    return (
      <MobileShell>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-background">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-success/15 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <Check size={48} className="text-success" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black text-foreground font-display">Order Secured!</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground mt-2 text-sm leading-relaxed mb-10">Your electronics are being packed. The merchants have been notified.</motion.p>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full space-y-3">
            <button onClick={() => navigate("/customer/orders")} className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold text-base shadow-glow active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Package size={18} /> Track My Order
            </button>
            <button onClick={() => navigate("/customer/passbook")} className="w-full py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 border border-border">
              <Wallet size={18} /> View Passbook
            </button>
          </motion.div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="pb-32 bg-secondary/5 min-h-screen">
        
        {/* PREMIUM HEADER */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-5 py-4 flex items-center gap-4">
          <button onClick={() => { if (step === "payment") setStep("address"); else if (step === "confirm") setStep("payment"); else navigate(-1); }} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center justify-center transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-primary-foreground" fill="currentColor" />
            </div>
            <h1 className="text-xl font-extrabold text-foreground font-display tracking-tight">Checkout</h1>
          </div>
        </div>

        {/* STEPS INDICATOR */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-4 w-full h-1 bg-secondary rounded-full -z-10" />
            <div className="absolute left-0 top-4 h-1 bg-primary rounded-full -z-10 transition-all duration-500" style={{ width: `${(stepIndex / 2) * 100}%` }} />
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i <= stepIndex ? "gradient-primary text-primary-foreground shadow-glow ring-4 ring-background" : "bg-secondary text-muted-foreground ring-4 ring-background"}`}>
                  {i < stepIndex ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "address" && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-4">
              
              <div className="space-y-4">
                {addresses.length === 0 && !showAddForm && (
                   <div className="text-center py-12 bg-card rounded-[28px] border border-dashed border-border"><MapPin size={32} className="mx-auto text-muted-foreground/50 mb-3"/><p className="text-sm text-foreground font-bold">No addresses found</p></div>
                )}

                {addresses.map((addr) => (
                  <button
                    key={addr._id} onClick={() => setSelectedAddressId(addr._id)}
                    className={`w-full text-left p-5 rounded-[24px] border-2 transition-all duration-300 relative overflow-hidden ${selectedAddressId === addr._id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-card hover:border-primary/30"}`}
                  >
                    {selectedAddressId === addr._id && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full pointer-events-none" />}
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAddressId === addr._id ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                        {addr.label === "Home" ? <Home size={18}/> : addr.label === "Work" ? <Briefcase size={18}/> : <MapPin size={18}/>}
                      </div>
                      <span className="font-extrabold text-base text-foreground capitalize">{addr.label}</span>
                      {addr.isDefault && <Badge className="bg-secondary text-foreground border-border rounded-md text-[9px] font-bold ml-auto px-2 py-1 uppercase">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground ml-13 leading-relaxed whitespace-pre-wrap line-clamp-2 pl-[52px]">{addr.address}</p>
                  </button>
                ))}

                {showAddForm ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-[28px] border border-border shadow-elevated space-y-4">
                     <p className="text-base font-extrabold text-foreground font-display flex items-center gap-2"><MapPin size={18} className="text-primary"/> Delivery Details</p>
                     
                     <button onClick={handleGetLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-bold hover:bg-primary/20 transition-all active:scale-[0.98]">
                       {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                       {isLocating ? "Fetching exact coordinates..." : "Auto-Locate with GPS"}
                     </button>

                     <div className="space-y-4 pt-2">
                       <textarea value={newAddress} onChange={(e)=>setNewAddress(e.target.value)} placeholder="Flat No, Building Name, Street..." className="w-full p-4 bg-secondary/50 rounded-2xl text-sm outline-none resize-none h-28 border border-transparent focus:border-primary/30 transition-colors" />
                       <div>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2.5">Save as</p>
                         <div className="flex gap-2">
                           {["Home", "Work", "Other"].map(tag => (
                             <button key={tag} onClick={() => setNewLabel(tag)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${newLabel === tag ? "bg-foreground text-background border-foreground shadow-md" : "bg-card text-muted-foreground border-border hover:bg-secondary"}`}>
                               {tag}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-3 pt-4">
                       <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl text-sm font-bold transition-colors">Cancel</button>
                       <button onClick={handleSaveAddress} disabled={isProcessing || !newAddress || !newLabel} className="flex-[2] py-4 gradient-primary text-primary-foreground rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50">
                         {isProcessing ? <Loader2 size={16} className="animate-spin"/> : "Save Address"}
                       </button>
                     </div>
                  </motion.div>
                ) : (
                  <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-primary/40 bg-primary/5 rounded-[24px] text-primary font-bold hover:bg-primary/10 transition-colors active:scale-[0.98]">
                    <Plus size={18} /> <span className="text-sm">Add New Address</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-6">
              <h2 className="text-lg font-extrabold text-foreground font-display mb-4">Select Payment</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={`w-full text-left p-5 rounded-[24px] border-2 transition-all duration-300 ${selectedPayment === method.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-card hover:bg-secondary/50"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedPayment === method.id ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                        <method.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-sm text-foreground">{method.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1">{method.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === method.id ? "border-primary bg-primary" : "border-border"}`}>
                        {selectedPayment === method.id && <Check size={12} className="text-primary-foreground stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-6">
              
              <div className="bg-card p-5 rounded-[24px] border border-border/50 shadow-sm space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0"><MapPin size={18} className="text-foreground" /></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{addresses.find(a => a._id === selectedAddressId)?.label || "Delivery"}</p>
                    <p className="text-xs text-foreground font-medium leading-relaxed">{addresses.find(a => a._id === selectedAddressId)?.address}</p>
                  </div>
                </div>
                <div className="h-px w-full bg-border border-dashed" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Wallet size={18} className="text-primary" /></div>
                  <p className="text-sm font-extrabold text-foreground">{PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label}</p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-[28px] border border-border/50 shadow-elevated relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                <p className="text-sm font-extrabold text-foreground font-display mb-5">Bill Details</p>
                <div className="space-y-3.5 relative z-10">
                  <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Subtotal</span><span className="text-xs font-mono font-bold text-foreground">₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Delivery Partner Fee</span><span className="text-xs font-mono font-bold text-success">{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Taxes (GST)</span><span className="text-xs font-mono font-bold text-foreground">₹{tax.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="flex justify-between items-center pt-5 mt-5 border-t border-dashed border-border/80 relative z-10">
                  <span className="font-black text-foreground">Amount to Pay</span>
                  <span className="text-xl font-black font-mono text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground/80">
                <ShieldCheck size={16} className="text-success" />
                <span className="text-[10px] font-bold uppercase tracking-wider">256-bit Secure Checkout</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!orderPlaced && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-t border-border px-5 py-4 z-50">
          <button
            disabled={isProcessing || (step === "address" && !selectedAddressId)}
            onClick={() => {
              if (step === "address") setStep("payment");
              else if (step === "payment") setStep("confirm");
              else handlePlaceOrder();
            }}
            className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 shadow-glow"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 
             step === "confirm" ? <>Pay ₹{total.toLocaleString('en-IN')}</> : 
             <>Continue <ChevronRight size={18} /></>}
          </button>
        </div>
      )}
    </MobileShell>
  );
};

export default CheckoutPage;