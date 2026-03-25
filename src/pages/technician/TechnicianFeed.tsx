import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { MOCK_TICKETS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

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

const TechnicianFeed: React.FC = () => {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAccept = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "in-progress" as const } : t))
    );
  };

  const handleResolve = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "resolved" as const } : t))
    );
  };

  const openTickets = tickets.filter((t) => t.status === "open");
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  return (
    <MobileShell>
      <div className="pb-8">
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Feed</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Hello, Mike T.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse-dot" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Online</span>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center"
            >
              <LogOut size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 flex gap-3 mb-6">
          <div className="flex-1 bg-card p-3 rounded-xl border border-border text-center">
            <p className="text-xl font-bold font-mono text-foreground">{openTickets.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Open</p>
          </div>
          <div className="flex-1 bg-card p-3 rounded-xl border border-border text-center">
            <p className="text-xl font-bold font-mono text-foreground">{inProgressTickets.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">In Progress</p>
          </div>
          <div className="flex-1 bg-card p-3 rounded-xl border border-border text-center">
            <p className="text-xl font-bold font-mono text-foreground">{resolvedTickets.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Resolved</p>
          </div>
        </div>

        {/* Open Tickets */}
        {openTickets.length > 0 && (
          <div className="px-5 mb-6">
            <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Open Tickets</h2>
            <div className="space-y-3">
              {openTickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card p-5 rounded-2xl border border-border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">{ticket.id}</p>
                      <h3 className="font-bold text-lg text-foreground">{ticket.device}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.customer} · {ticket.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`text-[9px] font-bold rounded-full border-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </Badge>
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                        <Wrench size={18} className="text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(ticket.id)}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <CheckCircle2 size={14} /> Accept Job
                    </button>
                    <button
                      onClick={() => navigate(`/technician/ticket/${ticket.id}`)}
                      className="px-4 py-3 bg-secondary text-muted-foreground rounded-xl text-xs font-bold"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgressTickets.length > 0 && (
          <div className="px-5 mb-6">
            <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">In Progress</h2>
            <div className="space-y-3">
              {inProgressTickets.map((ticket) => (
                <div key={ticket.id} className="bg-card p-5 rounded-2xl border border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">{ticket.id}</p>
                      <h3 className="font-bold text-foreground">{ticket.device}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.issue}</p>
                    </div>
                    <Badge className="bg-warning/10 text-warning border-0 rounded-full text-[9px] font-bold">
                      In Progress
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    className="w-full py-3 bg-success text-success-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved */}
        {resolvedTickets.length > 0 && (
          <div className="px-5">
            <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Resolved</h2>
            <div className="space-y-2">
              {resolvedTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border opacity-60">
                  <CheckCircle2 size={16} className="text-success" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{ticket.device}</p>
                    <p className="text-[10px] text-muted-foreground">{ticket.issue} · {ticket.customer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
};

export default TechnicianFeed;
