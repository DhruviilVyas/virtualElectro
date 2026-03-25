import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Package, ShoppingBag, Tag, Wrench, Plus, X, Copy, Percent, Clock, Trash2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const MOCK_PROMOS = [
  { id: 1, code: "SUMMER20", discount: 20, type: "percent", active: true, uses: 47, expiry: "2024-06-30" },
  { id: 2, code: "WELCOME10", discount: 10, type: "percent", active: true, uses: 128, expiry: "2024-12-31" },
  { id: 3, code: "FLAT50", discount: 50, type: "flat", active: false, uses: 15, expiry: "2024-02-28" },
];

const MERCHANT_TABS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/merchant" },
  { label: "Inventory", icon: Package, path: "/merchant/inventory" },
  { label: "Orders", icon: ShoppingBag, path: "/merchant/orders" },
  { label: "Offers", icon: Tag, path: "/merchant/offers" },
  { label: "Issues", icon: Wrench, path: "/merchant/issues" },
];

const MerchantOffers: React.FC = () => {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [promos, setPromos] = useState(MOCK_PROMOS);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");

  const handleCreate = () => {
    if (!newCode || !newDiscount) return;
    setPromos((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        code: newCode.toUpperCase(),
        discount: Number(newDiscount),
        type: "percent",
        active: true,
        uses: 0,
        expiry: "2025-12-31",
      },
    ]);
    setShowAdd(false);
    setNewCode("");
    setNewDiscount("");
    toast({ title: "Promo Created", description: `Code ${newCode.toUpperCase()} is now active.` });
  };

  return (
    <MobileShell>
      <div className="pb-24">
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offers & Promos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{promos.length} promo codes</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
          >
            <Plus size={14} /> Create
          </button>
        </div>

        <div className="px-5 space-y-3">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card p-4 rounded-2xl border border-border"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                    <span className="font-mono font-bold text-primary text-sm">{promo.code}</span>
                  </div>
                  <Badge
                    className={`text-[9px] font-bold rounded-full border-0 ${
                      promo.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {promo.active ? "Active" : "Expired"}
                  </Badge>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(promo.code);
                    toast({ title: "Copied!", description: promo.code });
                  }}
                  className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"
                >
                  <Copy size={12} className="text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Percent size={12} />
                  {promo.type === "percent" ? `${promo.discount}% off` : `$${promo.discount} off`}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {promo.uses} uses
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {promo.expiry}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Promo Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] bg-card rounded-t-3xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground">Create Promo Code</h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <input
                placeholder="Promo Code (e.g. SUMMER20)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full p-4 bg-secondary rounded-xl text-sm outline-none font-mono uppercase"
              />
              <div className="flex gap-3">
                <input
                  placeholder="Discount %"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  type="number"
                  className="flex-1 p-4 bg-secondary rounded-xl text-sm outline-none"
                />
                <input
                  placeholder="Expiry Date"
                  defaultValue="2025-12-31"
                  className="flex-1 p-4 bg-secondary rounded-xl text-sm outline-none"
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full py-4 bg-foreground text-background rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
              >
                Create Promo Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomTabBar items={MERCHANT_TABS} />
    </MobileShell>
  );
};

export default MerchantOffers;
