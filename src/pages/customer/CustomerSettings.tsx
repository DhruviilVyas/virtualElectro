// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Bell, Moon, Globe, ShieldCheck, 
  MapPin, KeyRound, LogOut, ChevronRight, User as UserIcon
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useToast } from "@/hooks/use-toast";

const CustomerSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("electrocare_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name || "User");
        setUserEmail(u.email || "");
      } catch(e) {}
    }
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("electrocare_token");
    localStorage.removeItem("electrocare_user");
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
    navigate("/");
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, isToggle, toggleValue, setToggle }: unknown) => (
    <button 
      onClick={isToggle ? () => setToggle(!toggleValue) : onClick} 
      className="w-full flex items-center justify-between p-4 bg-card border-b border-border/50 hover:bg-secondary/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><Icon size={16} /></div>
        <span className="font-bold text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-muted-foreground font-medium">{value}</span>}
        {isToggle ? (
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${toggleValue ? 'bg-primary' : 'bg-secondary border border-border'}`}>
            <motion.div 
              layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-4 h-4 rounded-full bg-white shadow-sm ${toggleValue ? 'ml-auto' : 'ml-0 bg-muted-foreground'}`}
            />
          </div>
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </div>
    </button>
  );

  return (
    <MobileShell>
      <div className="pb-10 bg-secondary/5 min-h-screen">
        
        {/* 👉 HEADER */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm px-5 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center justify-center transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground font-display tracking-tight">Settings</h1>
        </div>

        {/* 👉 PROFILE SNIPPET */}
        <div className="px-5 mt-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-2xl font-black text-primary-foreground uppercase shadow-glow">
              {userName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground capitalize">{userName}</h2>
              <p className="text-xs text-muted-foreground font-medium">{userEmail}</p>
            </div>
            <button onClick={() => toast({ title: "Coming Soon", description: "Profile editing will be available soon." })} className="ml-auto px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl active:scale-95 transition-transform">
              Edit
            </button>
          </div>
        </div>

        {/* 👉 ACCOUNT SETTINGS */}
        <div className="px-5 mb-6">
          <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Account</p>
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
            <SettingItem icon={UserIcon} label="Personal Information" onClick={() => {}} />
            <SettingItem icon={MapPin} label="Saved Addresses" onClick={() => navigate('/customer/checkout')} />
            <SettingItem icon={ShieldCheck} label="Privacy & Data" onClick={() => {}} />
          </div>
        </div>

        {/* 👉 APP PREFERENCES */}
        <div className="px-5 mb-6">
          <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Preferences</p>
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
            <SettingItem icon={Bell} label="Push Notifications" isToggle toggleValue={pushEnabled} setToggle={setPushEnabled} />
            <SettingItem icon={Moon} label="Dark Theme" isToggle toggleValue={darkTheme} setToggle={setDarkTheme} />
            <SettingItem icon={Globe} label="Language" value="English (IN)" onClick={() => {}} />
          </div>
        </div>

        {/* 👉 SECURITY */}
        <div className="px-5 mb-8">
          <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Security</p>
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
            <SettingItem icon={KeyRound} label="Change Password" onClick={() => {}} />
          </div>
        </div>

        {/* 👉 LOGOUT */}
        <div className="px-5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-2xl font-bold text-sm active:scale-95 transition-transform border border-destructive/20 hover:bg-destructive/20"
          >
            <LogOut size={18} /> Sign Out of App
          </button>
          <p className="text-center text-[10px] text-muted-foreground font-mono mt-6">Version 2.1.0 (Build 402)</p>
        </div>

      </div>
    </MobileShell>
  );
};

export default CustomerSettings;