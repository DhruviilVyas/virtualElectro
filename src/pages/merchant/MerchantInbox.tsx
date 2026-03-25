import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft, MessageCircle, Search, Send, CheckCheck, Loader2
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MerchantInbox: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // 👉 STATES
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  // Chat Room States
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isFetchingChat, setIsFetchingChat] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  // 👉 1. INITIALIZE SOCKET & FETCH CONTACTS
 // 👉 1. INITIALIZE SOCKET & FETCH CONTACTS
  useEffect(() => {
    const token = localStorage.getItem("electrocare_token");
    if (!token || !user?._id) return;

    const initSocketsAndData = async () => {
      // Setup Socket FIRST
      socketRef.current = io("http://localhost:5000", { auth: { token } });
      socketRef.current.emit("register_user", user._id);

      // Listeners
      socketRef.current.on("receive_private_message", (msg) => {
        setMessages((prev) => {
          // Active chat update
          if (msg.senderId === activeChat?.contactId) return [...prev, msg];
          return prev;
        });

        // Contact list update logic
        setContacts((prevContacts) => {
          const existing = prevContacts.find((c) => c.contactId === msg.senderId);
          if (existing) {
            const updated = prevContacts.filter((c) => c.contactId !== msg.senderId);
            return [
              {
                ...existing,
                lastMessage: msg.text,
                time: msg.createdAt,
                unreadCount: activeChat?.contactId === msg.senderId ? 0 : existing.unreadCount + 1,
              },
              ...updated,
            ];
          } else {
            fetchContacts(); // Fetch entirely new contact
            return prevContacts;
          }
        });
      });

      socketRef.current.on("message_sent_successfully", (msg) => {
        setMessages((prev) => [...prev, msg]);
        setContacts((prevContacts) => {
          const existing = prevContacts.find((c) => c.contactId === msg.receiverId);
          if (existing) {
            const updated = prevContacts.filter((c) => c.contactId !== msg.receiverId);
            return [{ ...existing, lastMessage: msg.text, time: msg.createdAt }, ...updated];
          }
          return prevContacts;
        });
      });

      // 👉 FETCH LIST OF CONTACTS FROM DB
      const fetchContacts = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/chats/contacts", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) setContacts(await res.json());
        } catch (error) {
          toast({ title: "Error", description: "Failed to load inbox.", variant: "destructive" });
        } finally {
          setIsLoadingContacts(false);
        }
      };

      fetchContacts();
    };

    initSocketsAndData();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, activeChat]); // Add activeChat as dependency so socket has the latest state
  //  // 👉 2. OPEN A CHAT
  const handleOpenChat = async (contact: any) => {
    setActiveChat(contact);
    setIsFetchingChat(true);
    
    // Reset unread count locally
    setContacts(prev => prev.map(c => c.contactId === contact.contactId ? { ...c, unreadCount: 0 } : c));

    const token = localStorage.getItem("electrocare_token");
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${contact.contactId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      toast({ title: "Error", description: "Could not load chat.", variant: "destructive" });
    } finally {
      setIsFetchingChat(false);
    }
  };

  // 👉 3. SEND MESSAGE
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !socketRef.current || !activeChat) return;

    const data = {
      senderId: user?._id,
      receiverId: activeChat.contactId,
      text: currentMessage
    };

    socketRef.current.emit("send_private_message", data);
    setCurrentMessage("");
  };

  return (
    <MobileShell>
      <div className="h-screen flex flex-col bg-background relative overflow-hidden">
        
        {/* =========================================
            VIEW 1: CONTACTS LIST (INBOX)
            ========================================= */}
        <AnimatePresence>
          {!activeChat && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: -50, opacity: 0 }}
              className="absolute inset-0 flex flex-col z-10 bg-background"
            >
              {/* Inbox Header */}
              <div className="px-5 pt-6 pb-4 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary/50 rounded-2xl flex items-center justify-center">
                    <ArrowLeft size={20} className="text-foreground" />
                  </button>
                  <h1 className="text-2xl font-extrabold text-foreground font-display">Inbox</h1>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    placeholder="Search customers..." 
                    className="w-full py-3.5 pl-11 pr-4 bg-secondary/50 rounded-2xl text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto px-5 py-2">
                {isLoadingContacts ? (
                  <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
                ) : contacts.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-20">
                    <MessageCircle size={40} className="mx-auto opacity-20 mb-4" />
                    <p className="font-bold text-foreground">No messages yet</p>
                    <p className="text-xs mt-1">When customers message you, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((contact, i) => (
                      <motion.button
                        key={contact.contactId}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => handleOpenChat(contact)}
                        className="w-full flex items-center gap-4 p-4 glass rounded-3xl shadow-sm border border-border/50 active:scale-[0.98] transition-transform text-left"
                      >
                        <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center text-primary-foreground font-black text-lg uppercase shadow-inner shrink-0 relative">
                          {contact.contactName.charAt(0)}
                          {contact.unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-destructive border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="font-extrabold text-sm text-foreground truncate">{contact.contactName}</p>
                            <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                              {new Date(contact.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className={`text-xs truncate ${contact.unreadCount > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                              {contact.lastMessage}
                            </p>
                            {contact.unreadCount > 0 && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground ml-2 shrink-0">
                                {contact.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================
            VIEW 2: ACTIVE CHAT ROOM
            ========================================= */}
        <AnimatePresence>
          {activeChat && (
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 flex flex-col z-30 bg-background"
            >
              {/* Chat Room Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-card/90 backdrop-blur-md pt-6">
                <button onClick={() => setActiveChat(null)} className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                  <ArrowLeft size={20} className="text-foreground" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center text-primary-foreground font-bold uppercase">
                    {activeChat.contactName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-foreground capitalize">{activeChat.contactName}</p>
                    <p className="text-[10px] text-success font-bold flex items-center gap-1">Customer</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary/5">
                {isFetchingChat ? (
                  <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-primary" size={24} /></div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderId === user?._id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`p-3.5 rounded-3xl text-sm max-w-[80%] shadow-sm ${isMine ? 'gradient-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                          <p>{msg.text}</p>
                          <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMine && <CheckCheck size={12} className={msg.isRead ? "text-info" : "opacity-70"} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border pb-8 flex items-center gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <input 
                  type="text" 
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a reply..." 
                  className="flex-1 bg-secondary rounded-full px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-50 active:scale-95 transition-transform shrink-0"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileShell>
  );
};

export default MerchantInbox;