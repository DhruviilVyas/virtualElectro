import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserData {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  user: UserData | null;
  // Make sure this expects TWO arguments
  login: (role: string, userData: UserData) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("electrocare_token");
    const savedUser = localStorage.getItem("electrocare_user");
    
    if (token && savedUser) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(savedUser);
      setRole(parsedUser.role);
      setUser(parsedUser);
    }
    setLoading(false); 
  }, []);

  const login = (newRole: string, userData: UserData) => {
    setIsLoggedIn(true);
    setRole(newRole);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("electrocare_token");
    localStorage.removeItem("electrocare_user");
    // Do NOT remove electrocare_cart here if you moved it to the DB.
    // If still using localStorage for cart, remove it: localStorage.removeItem("electrocare_cart");
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
  };

  if (loading) return null; 

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
};