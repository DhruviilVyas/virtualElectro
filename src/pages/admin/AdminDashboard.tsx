import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Users, Store, DollarSign, TrendingUp, ShieldCheck, ShieldX,
  Eye, ChevronRight, BarChart3, Settings, LogOut, AlertTriangle
} from "lucide-react";
import { MOCK_SHOPS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = ["Overview", "Shop Approvals", "Shop Management", "Users", "Settings"];

const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState("Overview");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const pendingShops = MOCK_SHOPS.filter((s) => s.status === "pending");
  const approvedShops = MOCK_SHOPS.filter((s) => s.status === "approved");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-sidebar-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">ElectroCare</span>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-colors ${
                activeNav === item
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 p-3 text-sm font-medium text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        {activeNav === "Overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
                <p className="text-muted-foreground mt-1">Global metrics and management.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Users", value: "12,847", icon: Users, change: "+5.2%" },
                { label: "Active Shops", value: approvedShops.length.toString(), icon: Store, change: "+2" },
                { label: "Commission", value: "$42,890", icon: DollarSign, change: "+18%" },
                { label: "Pending", value: pendingShops.length.toString(), icon: AlertTriangle, change: "" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card p-6 rounded-2xl border border-border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <stat.icon size={18} className="text-muted-foreground" />
                    {stat.change && (
                      <span className="text-xs font-bold text-success flex items-center gap-0.5">
                        <TrendingUp size={12} />
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Approvals */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-bold text-foreground">Pending Shop Approvals</h2>
                <Badge className="bg-primary/10 text-primary border-0 rounded-full text-xs font-bold">
                  {pendingShops.length} Pending
                </Badge>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/50">
                    <th className="p-6">Shop</th>
                    <th className="p-6">Owner</th>
                    <th className="p-6">Email</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pendingShops.map((shop) => (
                    <tr key={shop.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                      <td className="p-6 font-bold text-foreground flex items-center gap-3">
                        <span className="text-xl">{shop.logo}</span> {shop.name}
                      </td>
                      <td className="p-6 text-muted-foreground">{shop.owner}</td>
                      <td className="p-6 text-muted-foreground">{shop.email}</td>
                      <td className="p-6 text-right space-x-2">
                        <button className="px-4 py-2 bg-foreground text-background rounded-lg font-bold text-xs">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-card border border-border rounded-lg font-bold text-xs text-muted-foreground">
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeNav === "Shop Approvals" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Shop Approvals</h1>
            <p className="text-muted-foreground mb-8">Review and manage merchant applications.</p>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/50">
                    <th className="p-6">Shop Name</th>
                    <th className="p-6">Owner</th>
                    <th className="p-6">Documents</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pendingShops.map((shop) => (
                    <tr key={shop.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                      <td className="p-6 font-bold text-foreground">{shop.name}</td>
                      <td className="p-6 text-muted-foreground">{shop.owner}</td>
                      <td className="p-6">
                        <span className="text-primary underline cursor-pointer text-xs">KYC_Doc.pdf</span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button className="px-4 py-2 bg-foreground text-background rounded-lg font-bold text-xs">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-card border border-border rounded-lg font-bold text-xs text-muted-foreground">
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeNav === "Shop Management" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Shop Management</h1>
            <p className="text-muted-foreground mb-8">Monitor and manage active shops.</p>

            <div className="grid grid-cols-1 gap-4">
              {approvedShops.map((shop) => (
                <div key={shop.id} className="bg-card p-6 rounded-2xl border border-border flex items-center gap-6">
                  <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-2xl">
                    {shop.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{shop.name}</h3>
                      <Badge className="bg-success/10 text-success border-0 rounded-full text-[9px] font-bold">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{shop.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-mono font-bold text-foreground">${shop.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-mono font-bold text-foreground">{shop.totalOrders}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 bg-secondary rounded-lg text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Eye size={12} /> View
                    </button>
                    <button className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-bold flex items-center gap-1">
                      <ShieldX size={12} /> Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(activeNav === "Users" || activeNav === "Settings") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">{activeNav}</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
