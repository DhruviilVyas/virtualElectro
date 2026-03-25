import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages Imports
import AuthPage from "@/pages/AuthPage";
import CustomerHome from "@/pages/customer/CustomerHome";
import CustomerNearby from "@/pages/customer/CustomerNearby";
import CustomerWishlist from "@/pages/customer/CustomerWishlist";
import CustomerProfile from "@/pages/customer/CustomerProfile";
import ProductDetailPage from "@/pages/customer/ProductDetailPage";
import CustomerCart from "@/pages/customer/CustomerCart";
import CheckoutPage from "@/pages/customer/CheckoutPage";
import RaiseTicketPage from "@/pages/customer/RaiseTicketPage";
import ShopDetailPage from "@/pages/customer/ShopDetailPage";

import MerchantDashboard from "@/pages/merchant/MerchantDashboard";
import MerchantInventory from "@/pages/merchant/MerchantInventory";
import MerchantOrders from "@/pages/merchant/MerchantOrders";
import MerchantOffers from "@/pages/merchant/MerchantOffers";
import MerchantIssues from "@/pages/merchant/MerchantIssues";
import MerchantInbox from "./pages/merchant/MerchantInbox"; // 👈 Import check karo
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TechnicianFeed from "@/pages/technician/TechnicianFeed";
import TicketDetailPage from "@/pages/technician/TicketDetailPage";
import NotFound from "@/pages/NotFound";
import CustomerOrders from "@/pages/customer/CustomerOrders";
import CustomerPassbook from "./pages/customer/CustomerPassbook";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoggedIn, role } = useAuth();

  // Agar user logged in nahi hai, toh sirf Login page dikhao
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={<AuthPage />} />
        {/* Koi bhi galat URL dale toh wapas Login pe phek do */}
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    );
  }

  // 🔒 THE FIX: STRICT ROLE-BASED ROUTING (AUTHORIZATION)
  return (
    <Routes>
      
      {/* 🟢 STRICTLY FOR CUSTOMERS ONLY */}
      {role === "customer" && (
        <>
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/nearby" element={<CustomerNearby />} />
          <Route path="/customer/wishlist" element={<CustomerWishlist />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/product/:id" element={<ProductDetailPage />} />
          <Route path="/customer/cart" element={<CustomerCart />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/passbook" element={<CustomerPassbook />} />
          <Route path="/customer/checkout" element={<CheckoutPage />} />
          <Route path="/customer/raise-ticket" element={<RaiseTicketPage />} />
          <Route path="/customer/shop/:id" element={<ShopDetailPage />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />
          {/* Customer kisi aur URL pe jaye toh wapas Home pe bhej do */}
          <Route path="*" element={<Navigate to="/customer" replace />} />
        </>
      )}

      {/* 🟠 STRICTLY FOR MERCHANTS ONLY */}
      {role === "merchant" && (
        <>
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="/merchant/inventory" element={<MerchantInventory />} />
          <Route path="/merchant/orders" element={<MerchantOrders />} />
          <Route path="/merchant/offers" element={<MerchantOffers />} />
          <Route path="/merchant/issues" element={<MerchantIssues />} />
          <Route path="/merchant/inbox" element={<MerchantInbox />} />
          {/* Merchant kisi aur URL pe jaye toh wapas Dashboard pe bhej do */}
          <Route path="*" element={<Navigate to="/merchant" replace />} />
        </>
      )}

      {/* 🔴 STRICTLY FOR ADMIN ONLY */}
      {role === "admin" && (
        <>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      )}

      {/* 🔵 STRICTLY FOR TECHNICIAN ONLY */}
      {role === "technician" && (
        <>
          <Route path="/technician" element={<TechnicianFeed />} />
          <Route path="/technician/ticket/:id" element={<TicketDetailPage />} />
          <Route path="*" element={<Navigate to="/technician" replace />} />
        </>
      )}

    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;