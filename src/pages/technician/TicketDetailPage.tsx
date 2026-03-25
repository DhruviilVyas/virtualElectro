import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, Mail, Navigation, ShieldCheck, ShieldX,
  Clock, Wrench, CheckCircle2, User, Calendar, AlertTriangle
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { MOCK_TICKETS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

// Extended ticket data with customer details
const TICKET_DETAILS: Record<string, {
  address: string;
  phone: string;
  email: string;
  warrantyStatus: "active" | "expired";
  warrantyExpiry: string;
  productPurchaseDate: string;
  notes: string;
}> = {
  "TCK-201": {
    address: "42 West 4th St, Apt 3B, New York, NY 10012",
    phone: "+1 (555) 234-5678",
    email: "alex.d@email.com",
    warrantyStatus: "active",
    warrantyExpiry: "2025-09-15",
    productPurchaseDate: "2024-03-05",
    notes: "Screen cracked after a fall. Touch still works partially.",
  },
  "TCK-202": {
    address: "88 Greenwich St, Floor 2, New York, NY 10006",
    phone: "+1 (555) 345-6789",
    email: "sarah.k@email.com",
    warrantyStatus: "active",
    warrantyExpiry: "2025-06-20",
    productPurchaseDate: "2023-12-20",
    notes: "Right analog stick drifts upward during gameplay.",
  },
  "TCK-203": {
    address: "150 E 44th St, Suite 400, New York, NY 10017",
    phone: "+1 (555) 456-7890",
    email: "tom.r@email.com",
    warrantyStatus: "expired",
    warrantyExpiry: "2024-01-10",
    productPurchaseDate: "2022-01-10",
    notes: "Battery drains within 3 hours. Charger works fine.",
  },
  "TCK-204": {
    address: "200 Broadway, Apt 12A, New York, NY 10038",
    phone: "+1 (555) 567-8901",
    email: "lisa.m@email.com",
    warrantyStatus: "active",
    warrantyExpiry: "2025-11-01",
    productPurchaseDate: "2024-02-01",
    notes: "USB-C port loose. Phone doesn't charge consistently.",
  },
  "TCK-205": {
    address: "55 Water St, New York, NY 10041",
    phone: "+1 (555) 678-9012",
    email: "mike.j@email.com",
    warrantyStatus: "active",
    warrantyExpiry: "2025-08-15",
    productPurchaseDate: "2024-02-15",
    notes: "Left earbud has no audio output. Right one works fine.",
  },
  "TCK-206": {
    address: "320 Park Ave, Floor 8, New York, NY 10022",
    phone: "+1 (555) 789-0123",
    email: "emma.w@email.com",
    warrantyStatus: "active",
    warrantyExpiry: "2025-04-30",
    productPurchaseDate: "2023-10-30",
    notes: "CPU temperatures spike to 95°C under light load.",
  },
};

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const ticket = MOCK_TICKETS.find((t) => t.id === id);
  const details = id ? TICKET_DETAILS[id] : undefined;

  if (!ticket || !details) return null;

  return (
    <MobileShell>
      <div className="pb-32">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{ticket.id}</h1>
            <p className="text-[10px] text-muted-foreground">{ticket.device}</p>
          </div>
          <Badge className={`text-[9px] font-bold rounded-full border-0 ${PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority}
          </Badge>
        </div>

        <div className="px-5 mt-5 space-y-5">
          {/* Issue Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-5 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Issue</h2>
            </div>
            <h3 className="font-bold text-lg text-foreground">{ticket.issue}</h3>
            <p className="text-sm text-muted-foreground mt-2">{details.notes}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Calendar size={12} />
              <span>Reported: {ticket.date}</span>
            </div>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card p-5 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Customer</h2>
            </div>
            <p className="font-bold text-foreground">{ticket.customer}</p>
            <div className="mt-3 space-y-2">
              <a href={`tel:${details.phone}`} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <Phone size={14} className="text-primary" />
                <span className="text-sm text-foreground font-medium">{details.phone}</span>
              </a>
              <a href={`mailto:${details.email}`} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <Mail size={14} className="text-primary" />
                <span className="text-sm text-foreground font-medium">{details.email}</span>
              </a>
            </div>
          </motion.div>

          {/* Address & Map */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-5 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Location</h2>
            </div>

            {/* Map Placeholder */}
            <div className="h-40 bg-secondary rounded-xl flex items-center justify-center mb-3 border border-border">
              <div className="text-center text-muted-foreground">
                <Navigation size={24} className="mx-auto mb-2" />
                <p className="text-xs font-medium">Map View</p>
                <p className="text-[10px] mt-0.5">Tap to open in Maps</p>
              </div>
            </div>

            <p className="text-sm text-foreground">{details.address}</p>
            <button className="mt-3 w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Navigation size={14} /> Get Directions
            </button>
          </motion.div>

          {/* Warranty Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`p-5 rounded-2xl border ${
              details.warrantyStatus === "active"
                ? "bg-success/5 border-success/20"
                : "bg-destructive/5 border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {details.warrantyStatus === "active" ? (
                <ShieldCheck size={16} className="text-success" />
              ) : (
                <ShieldX size={16} className="text-destructive" />
              )}
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Warranty</h2>
              <Badge
                className={`text-[9px] font-bold rounded-full border-0 ml-auto ${
                  details.warrantyStatus === "active"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {details.warrantyStatus === "active" ? "Active" : "Expired"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase Date</span>
                <span className="font-mono font-medium text-foreground">{details.productPurchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Warranty Until</span>
                <span className="font-mono font-medium text-foreground">{details.warrantyExpiry}</span>
              </div>
            </div>
            {details.warrantyStatus === "expired" && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle size={12} className="text-destructive" />
                <span className="text-[10px] text-destructive font-medium">Service charges may apply</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/95 backdrop-blur-xl border-t border-border px-5 py-4 flex gap-3 z-50">
        {ticket.status === "open" && (
          <button className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <CheckCircle2 size={16} /> Accept Job
          </button>
        )}
        {ticket.status === "in-progress" && (
          <button className="flex-1 py-4 bg-success text-success-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <CheckCircle2 size={16} /> Mark Resolved
          </button>
        )}
        <button className="px-6 py-4 bg-secondary text-muted-foreground rounded-2xl font-bold text-sm">
          Contact
        </button>
      </div>
    </MobileShell>
  );
};

export default TicketDetailPage;
