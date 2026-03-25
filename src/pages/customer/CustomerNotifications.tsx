import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Bell, CheckCheck, Package, Tag, 
  Wrench, ShieldCheck, Trash2 
} from "lucide-react";
import MobileShell from "@/components/MobileShell";

// Smart Mock Data for a Premium Feel
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "Order Shipped! 🚚",
    message: "Your Apple MacBook Pro has been shipped. Track your delivery now.",
    time: "2 mins ago",
    isRead: false,
    icon: Package,
    color: "bg-accent/10 text-accent",
  },
  {
    id: 2,
    type: "offer",
    title: "Flash Sale Alert ⚡",
    message: "Get up to 40% OFF on premium audio devices. Offer valid till midnight!",
    time: "1 hour ago",
    isRead: false,
    icon: Tag,
    color: "bg-warning/10 text-warning",
  },
  {
    id: 3,
    type: "service",
    title: "Technician Assigned 🔧",
    message: "Rahul (Expert Tech) has been assigned to your AC Repair ticket.",
    time: "3 hours ago",
    isRead: true,
    icon: Wrench,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 4,
    type: "system",
    title: "Security Alert 🛡️",
    message: "New login detected from a Chrome browser on Windows.",
    time: "1 day ago",
    isRead: true,
    icon: ShieldCheck,
    color: "bg-success/10 text-success",
  }
];

const FILTERS = ["All", "Orders", "Offers", "Services"];

const CustomerNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("All");

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Orders") return n.type === "order";
    if (activeFilter === "Offers") return n.type === "offer";
    if (activeFilter === "Services") return n.type === "service";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MobileShell>
      <div className="min-h-screen bg-secondary/10 pb-10 flex flex-col">
        
        {/* 👉 HEADER */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-xl flex items-center justify-center transition-colors">
                  <ArrowLeft size={20} className="text-foreground" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground font-display flex items-center gap-2">
                    Notifications 
                    {unreadCount > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </h1>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-bold text-primary flex items-center gap-1 active:scale-95 transition-transform bg-primary/10 px-3 py-1.5 rounded-lg">
                  <CheckCheck size={14} /> Read All
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1">
              {FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === filter 
                      ? "bg-foreground text-background shadow-md" 
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 👉 NOTIFICATIONS LIST */}
        <div className="px-5 mt-4 flex-1">
          <AnimatePresence mode="popLayout">
            {filteredNotifs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center text-center py-20 h-full"
              >
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-foreground text-lg">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground mt-1">You have no {activeFilter !== "All" ? activeFilter.toLowerCase() : "new"} notifications right now.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredNotifs.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden group ${
                      notif.isRead 
                        ? "bg-card border-border/50 shadow-sm" 
                        : "bg-background border-primary/30 shadow-elevated"
                    }`}
                  >
                    {/* Unread Indicator Line */}
                    {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 gradient-primary" />}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
                        <notif.icon size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-extrabold truncate pr-2 ${notif.isRead ? "text-foreground/80" : "text-foreground"}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap pt-0.5">
                            {notif.time}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed line-clamp-2 pr-6 ${notif.isRead ? "text-muted-foreground" : "text-foreground/90 font-medium"}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button (Appears on hover in desktop, but works on mobile tap) */}
                    <button 
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="absolute bottom-4 right-4 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </MobileShell>
  );
};

export default CustomerNotifications;