import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, ShoppingBag, Tag, Wrench, CheckCircle2, MessageSquare } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import BottomTabBar from "@/components/BottomTabBar";
import { MOCK_TICKETS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  "in-progress": "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
};

const MERCHANT_TABS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/merchant" },
  { label: "Inventory", icon: Package, path: "/merchant/inventory" },
  { label: "Orders", icon: ShoppingBag, path: "/merchant/orders" },
  { label: "Offers", icon: Tag, path: "/merchant/offers" },
  { label: "Issues", icon: Wrench, path: "/merchant/issues" },
];

const MerchantIssues: React.FC = () => (
  <MobileShell>
    <div className="pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Customer Issues</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {MOCK_TICKETS.filter((t) => t.status !== "resolved").length} active tickets
        </p>
      </div>

      <div className="px-5 space-y-3">
        {MOCK_TICKETS.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card p-4 rounded-2xl border ${
              ticket.status === "resolved" ? "border-border opacity-50" : "border-border"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground">{ticket.id}</p>
                <h3 className="font-bold text-sm text-foreground">{ticket.device}</h3>
                <p className="text-xs text-muted-foreground">{ticket.issue}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge className={`text-[9px] font-bold rounded-full border-0 ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status}
                </Badge>
                <Badge className={`text-[9px] font-bold rounded-full border-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{ticket.customer}</span>
                <span>·</span>
                <span>{ticket.date}</span>
              </div>
              {ticket.status !== "resolved" && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-xs font-bold text-muted-foreground">
                  <MessageSquare size={12} /> Respond
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    <BottomTabBar items={MERCHANT_TABS} />
  </MobileShell>
);

export default MerchantIssues;
