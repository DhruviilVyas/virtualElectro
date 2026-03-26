// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://virtualelectro.onrender.com";

const ResetPassword: React.FC = () => {
  // Token comes from the URL (e.g. /reset-password/:token)
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
      } else {
        toast({ title: "Failed", description: data.error || "Invalid or expired token.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network Error", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-secondary/10 flex flex-col justify-center px-6 relative overflow-hidden">
        
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        
        {!isSuccess ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full relative z-10">
            <h1 className="text-3xl font-black font-display text-foreground mb-2">Create New Password</h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Your new password must be different from previous used passwords.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"} placeholder="New Password" 
                  className="w-full p-4 pl-11 pr-12 bg-card border border-border/50 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 focus:border-primary/50 transition-all shadow-sm" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  disabled={isLoading} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showPassword ? "text" : "password"} placeholder="Confirm New Password" 
                  className="w-full p-4 pl-11 pr-12 bg-card border border-border/50 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 focus:border-primary/50 transition-all shadow-sm" 
                />
              </div>
              
              <button 
                disabled={isLoading} type="submit"
                className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-glow active:scale-95 transition-transform flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center z-10">
            <div className="w-24 h-24 bg-success/15 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-black font-display text-foreground mb-3">Password Updated!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
              Your password has been changed successfully. You can now login with your new credentials.
            </p>
            <button onClick={() => navigate('/')} className="w-full py-4 mt-8 bg-card border border-border/50 rounded-2xl font-bold text-foreground shadow-sm active:scale-95 transition-transform">
              Back to Login
            </button>
          </motion.div>
        )}
      </div>
    </MobileShell>
  );
};

export default ResetPassword;