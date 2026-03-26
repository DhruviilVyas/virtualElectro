// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck, Loader2, CheckCircle2, Zap } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://virtualelectro.onrender.com";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Security Best Practice: Always show success even if email isn't in DB
      // to prevent attackers from guessing registered emails.
      setIsSent(true);
    } catch (err) {
      toast({ title: "Network Error", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-secondary/10 flex flex-col relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        <div className="px-5 py-4 flex items-center relative z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center justify-center transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col relative z-10">
          {!isSent ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full">
              <div className="w-16 h-16 gradient-primary rounded-[20px] flex items-center justify-center shadow-glow mb-6">
                <ShieldCheck size={32} className="text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-black font-display text-foreground mb-2">Reset Password</h1>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Enter the email address associated with your account. We'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email" 
                    placeholder="Enter your registered email" 
                    className="w-full p-4 pl-11 pr-4 bg-card border border-border/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground focus:ring-2 ring-primary/20 focus:border-primary/50 transition-all shadow-sm" 
                  />
                </div>
                
                <button 
                  disabled={isLoading} 
                  type="submit"
                  className="w-full py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-glow active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center mt-10">
              <div className="w-24 h-24 bg-success/15 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              <h2 className="text-2xl font-black font-display text-foreground mb-3">Check your inbox</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                If an account exists for <span className="font-bold text-foreground">{email}</span>, we have sent a password reset link.
              </p>
              <button onClick={() => navigate('/auth')} className="mt-8 text-sm font-bold text-primary hover:underline">
                Return to Login
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </MobileShell>
  );
};

export default ForgotPassword;