import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, 
  Clock, ShieldCheck, Loader2, ReceiptText
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const CustomerPassbook: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPassbook = async () => {
      const token = localStorage.getItem("electrocare_token");
      if (!token) return navigate("/");

      try {
        const res = await fetch("http://localhost:5000/api/users/passbook", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setBalance(data.walletBalance);
          setTransactions(data.transactions);
        } else {
          toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassbook();
  }, []);

  if (isLoading) {
    return (
      <MobileShell>
        <div className="flex h-screen items-center justify-center bg-secondary/5">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-secondary/5 pb-24">
        
        {/* 👉 HEADER */}
        <div className="bg-background/80 backdrop-blur-xl border-b border-border px-5 py-4 sticky top-0 z-20 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center justify-center transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground font-display">Wallet Passbook</h1>
        </div>

        {/* 👉 WALLET BALANCE CARD */}
        <div className="px-5 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 gradient-primary rounded-3xl text-primary-foreground relative overflow-hidden shadow-[0_15px_40px_-10px_rgba(var(--primary),0.4)]"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Wallet size={16} />
                <p className="text-xs font-extrabold uppercase tracking-wider">Available Coins</p>
              </div>
              <h2 className="text-5xl font-black font-mono tracking-tight drop-shadow-md">
                ₹{balance.toLocaleString('en-IN')}
              </h2>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-foreground/20">
                <ShieldCheck size={14} className="opacity-80" />
                <p className="text-[10px] font-medium opacity-80">100% Secured by ElectroCare Network</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 👉 TRANSACTION HISTORY */}
        <div className="px-5 mt-8">
          <h3 className="font-extrabold text-foreground mb-4 flex items-center gap-2 font-display">
            <Clock size={18} className="text-primary" /> Payment History
          </h3>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-card rounded-3xl border border-dashed border-border shadow-sm">
                <ReceiptText size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-bold text-foreground">No Transactions Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your payments and refunds will appear here.</p>
              </div>
            ) : (
              transactions.map((tx, i) => (
                <motion.div 
                  key={tx._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                  {/* Icon Indicator */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tx.isCredit ? 'bg-success/15 text-success' : 'bg-foreground/5 text-foreground'}`}>
                    {tx.isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-foreground truncate capitalize">
                      {tx.partnerName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {new Date(tx.date).toLocaleString('en-IN', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-1">
                      Txn: {tx._id.slice(-8)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className={`font-mono font-black text-base ${tx.isCredit ? 'text-success' : 'text-foreground'}`}>
                      {tx.isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                      {tx.type}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </MobileShell>
  );
};

export default CustomerPassbook;