import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, ArrowRight, ArrowLeft, Store, Sparkles, 
  Eye, EyeOff, Loader2,Phone, Mail, Lock, User, 
  MapPin, FileText, UploadCloud, ShieldCheck, CheckCircle2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/mockData";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const ROLES: { key: UserRole; label: string; emoji: string }[] = [
  { key: "customer", label: "Customer", emoji: "🛒" },
  { key: "merchant", label: "Merchant", emoji: "🏪" },
  { key: "technician", label: "Technician", emoji: "🔧" },
  { key: "admin", label: "Admin", emoji: "⚙️" },
];

const ROLE_ROUTES: Record<UserRole, string> = {
  customer: "/customer",
  merchant: "/merchant",
  admin: "/admin",
  technician: "/technician",
};

const AuthPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [isRegister, setIsRegister] = useState(false);
  const [merchantStep, setMerchantStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // 👉 FORM STATES
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 👉 NEW: Extra Merchant States (For UI realism)
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const sanitizedEmail = email.trim();

    if (isRegister && name.trim().length < 2) {
      toast({ title: "Validation Error", description: "Name must be at least 2 characters long.", variant: "destructive" });
      return false;
    }
    if (!emailRegex.test(sanitizedEmail)) {
      toast({ title: "Validation Error", description: "Please enter a valid email address.", variant: "destructive" });
      return false;
    }
    if (password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true); 
    const sanitizedEmail = email.trim().toLowerCase();
    const endpoint = isRegister ? "https://virtualelectro.onrender.com/api/auth/register" : "https://virtualelectro.onrender.com/api/auth/login";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: sanitizedEmail, 
          password, 
          role: selectedRole,
          // Sending extra merchant data (Backend might ignore if not in schema, but good for future)
          ...(selectedRole === 'merchant' && isRegister && { phone, address, gstin })
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("electrocare_token", data.token);
        localStorage.setItem("electrocare_user", JSON.stringify(data.user));
        
        toast({ title: "Success", description: "Authentication successful! 🚀" });
        
        login(data.user.role, data.user); 
        navigate(ROLE_ROUTES[data.user.role as UserRole]);
      } else {
        toast({ title: "Authentication Failed", description: data.error || "Invalid credentials", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Secure connection to server failed.", variant: "destructive" });
    } finally {
      setIsLoading(false); 
    }
  };

  const isMerchantRegistration = selectedRole === "merchant" && isRegister;

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-secondary/10 flex flex-col">
        
        {/* 👉 THE PREMIUM HEADER BACKGROUND */}
        <div className="absolute top-0 left-0 right-0 h-[340px] gradient-primary rounded-b-[40px] z-0 overflow-hidden shadow-lg">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 bottom-10 w-32 h-32 bg-black/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col p-6 pt-14 flex-1">
          
          {/* Header Content */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-glow">
              <Zap className="text-white" size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-white drop-shadow-md">
              ElectroCare
            </h1>
            <p className="text-white/80 mt-1.5 text-sm flex items-center justify-center gap-1.5 font-medium">
              <Sparkles size={14} className="text-warning" />
              India's #1 Electronics Hub
            </p>
          </motion.div>

          {/* 👉 THE FLOATING AUTH CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="bg-card rounded-[32px] shadow-2xl p-6 border border-border/50 flex-1 flex flex-col"
          >
            
            <div className="mb-6 text-center">
              <h2 className="text-xl font-extrabold text-foreground font-display">
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Select your role to continue</p>
            </div>

            {/* Role Selector (2x2 Grid for cleaner look) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  disabled={isLoading}
                  onClick={() => {
                    setSelectedRole(r.key);
                    setMerchantStep(0);
                  }}
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
                    selectedRole === r.key
                      ? "bg-primary/10 text-primary border-2 border-primary shadow-sm"
                      : "bg-secondary text-muted-foreground border-2 border-transparent hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-lg">{r.emoji}</span>
                  {r.label}
                  {selectedRole === r.key && <CheckCircle2 size={14} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>

            {/* Form Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isMerchantRegistration ? (
                  <motion.div key={`merchant-step-${merchantStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-6">
                      {[0, 1, 2].map((s) => (
                        <div key={s} className="h-1.5 flex-1 rounded-full overflow-hidden bg-secondary">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: s <= merchantStep ? "100%" : "0%" }}
                            className="h-full gradient-primary rounded-full" transition={{ duration: 0.4 }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* STEP 0: Account Details */}
                    {merchantStep === 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-extrabold text-foreground font-display flex items-center gap-2"><Store size={16} className="text-primary"/> Store Admin Details</p>
                        
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input disabled={isLoading} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Owner Name" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                        </div>
                        
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input disabled={isLoading} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Business Email" type="email" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input disabled={isLoading} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Create Password" type={showPassword ? "text" : "password"} className="w-full p-4 pl-11 pr-12 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 1: Business Profile */}
                    {merchantStep === 1 && (
                      <div className="space-y-3">
                        <p className="text-sm font-extrabold text-foreground font-display flex items-center gap-2"><MapPin size={16} className="text-primary"/> Business Profile</p>
                        
                        <div className="relative">
                          <Phone className="absolute left-4 top-4 text-muted-foreground" size={18} />
                          <input disabled={isLoading} value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Support Phone Number" type="tel" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                        </div>

                        <div className="relative">
                          <FileText className="absolute left-4 top-4 text-muted-foreground" size={18} />
                          <input disabled={isLoading} value={gstin} onChange={(e)=>setGstin(e.target.value)} placeholder="GSTIN / Business PAN" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm font-mono uppercase transition-all" />
                        </div>

                        <textarea disabled={isLoading} value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Complete Shop Address..." className="w-full p-4 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm h-24 resize-none transition-all" />
                      </div>
                    )}

                    {/* STEP 2: Document Verification (UI ONLY) */}
                    {merchantStep === 2 && (
                      <div className="space-y-3">
                        <p className="text-sm font-extrabold text-foreground font-display flex items-center gap-2"><ShieldCheck size={16} className="text-primary"/> KYC Verification</p>
                        
                        <div className="p-4 border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl text-center cursor-pointer hover:bg-primary/10 transition-colors">
                          <UploadCloud size={24} className="mx-auto text-primary mb-2" />
                          <p className="text-xs font-bold text-primary">Upload Shop Photo</p>
                          <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                        </div>

                        <div className="p-4 border-2 border-dashed border-border bg-secondary/30 rounded-2xl text-center cursor-pointer hover:bg-secondary transition-colors">
                          <UploadCloud size={24} className="mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs font-bold text-foreground">Upload Business Pan/Aadhaar</p>
                          <p className="text-[10px] text-muted-foreground mt-1">PDF or JPG up to 5MB</p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 p-3 bg-success/10 rounded-xl">
                          <ShieldCheck size={16} className="text-success shrink-0" />
                          <p className="text-[10px] text-success font-medium leading-tight">Your documents are encrypted and securely stored for verification purposes only.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {merchantStep > 0 && (
                        <button disabled={isLoading} onClick={() => setMerchantStep((s) => s - 1)} className="px-5 py-4 bg-secondary text-foreground rounded-2xl font-bold text-sm flex items-center justify-center active:scale-95 transition-transform">
                          <ArrowLeft size={18} />
                        </button>
                      )}
                      <button
                        disabled={isLoading}
                        onClick={() => {
                          if (merchantStep < 2) setMerchantStep((s) => s + 1);
                          else handleSubmit();
                        }}
                        className="flex-1 py-4 gradient-primary text-primary-foreground rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : merchantStep < 2 ? <>Continue <ArrowRight size={18} /></> : <><Store size={18} /> Complete Setup</>}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  
                  /* 👉 STANDARD FORM (Customer / Login) */
                  <motion.div key="standard-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {isRegister && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                      </div>
                    )}
                    
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" type="email" className="w-full p-4 pl-11 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all" />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        disabled={isLoading}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full p-4 pl-11 pr-12 bg-secondary/50 rounded-2xl outline-none focus:bg-background focus:ring-2 ring-primary/20 border border-transparent focus:border-primary/30 text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {!isRegister && (
                      <div className="flex justify-end">
                        <button className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
                      </div>
                    )}

                    <button disabled={isLoading} onClick={handleSubmit} className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold text-base active:scale-[0.98] transition-transform shadow-glow mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading && <Loader2 size={18} className="animate-spin" />}
                      {isRegister ? "Create Account" : "Secure Login"}
                      {!isLoading && <ArrowRight size={18} />}
                    </button>

                    {!isRegister && (
                      <>
                        <div className="flex items-center gap-3 my-6">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">or continue with</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button disabled={isLoading} className="py-3.5 bg-secondary/50 hover:bg-secondary rounded-2xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
                          </button>
                          <button disabled={isLoading} className="py-3.5 bg-secondary/50 hover:bg-secondary rounded-2xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-colors">
                            <img src="https://www.svgrepo.com/show/512003/apple-173.svg" className="w-5 h-5 dark:invert" alt="Apple" /> Apple
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-6 mt-auto">
              <button
                disabled={isLoading}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setMerchantStep(0);
                  setName(""); setEmail(""); setPassword(""); 
                }}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isRegister ? (
                  <>Already have an account? <span className="text-primary font-bold">Login</span></>
                ) : (
                  <>New to ElectroCare? <span className="text-primary font-bold">Sign Up</span></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </MobileShell>
  );
};

export default AuthPage;