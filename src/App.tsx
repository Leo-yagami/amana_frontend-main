import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import {AuthRedirectRoute} from '@/components/AuthRedirectRoute'
import {AuthRedirectRouteDashboard} from '@/components/AuthRedirectRouteDashboard'
import { ProtectedRoute1 } from "@/components/ProtectedRouteDashboard";
import { ProtectedRoute2 } from "@/components/ProtectedRoutePayment";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import VerifyDonation from "./pages/VerifyDonation";
import Payment from "./pages/Payment";

// Dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
// import Beneficiaries from "./pages/dashboard/Beneficiaries";
// import BeneficiaryProfile from "./pages/dashboard/BeneficiaryProfile";
// import BeneficiaryForm from "./pages/dashboard/BeneficiaryForm";
import Families from "./pages/dashboard/Families";
import FamilyProfile from "./pages/dashboard/FamilyProfile";
import FamilyForm from "./pages/dashboard/FamilyForm";
import Donors from "./pages/dashboard/Donors";
import DonorProfile from "./pages/dashboard/DonorProfile";
import DonorForm from "./pages/dashboard/DonorForm";
import Donations from "./pages/dashboard/Donations";
import DonationProfile from "./pages/dashboard/DonationProfile";
import DonationForm from "./pages/dashboard/DonationForm";
import Campaigns from "./pages/dashboard/Campaigns";
import Events from "./pages/dashboard/Events";
import EventProfile from "./pages/dashboard/EventProfile";
import Finances from "./pages/dashboard/Finances";
import Reports from "./pages/dashboard/Reports";
import Reports2 from "./pages/dashboard/Reports2_0";
import Settings from "./pages/dashboard/Settings";
import ReportsAnalytics from "./pages/dashboard/Reports2_0";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
  fetch('/api').catch(() => {}); // wake up render
  }, [])

  return (
  // In your app's entry point (main.jsx or App.jsx)
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route 
            path="/login" 
            element={
              <AuthRedirectRouteDashboard>
                <Login />
              </AuthRedirectRouteDashboard>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <AuthRedirectRoute>
                <Signup />
              </AuthRedirectRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* <Route path="/payment" element={<Payment />} /> */}
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute2>
                <Payment />
              </ProtectedRoute2>
            } 
          />
          <Route path="/verify-donation/:token" element={<VerifyDonation />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute1>
                <DashboardLayout />
              </ProtectedRoute1>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="families" element={<Families />} />
            <Route path="families/new" element={<FamilyForm />} />
            <Route path="families/:id" element={<FamilyProfile />} />
            <Route path="families/:id/edit" element={<FamilyForm />} />
            <Route path="donors" element={<Donors />} />
            <Route path="donors/new" element={<DonorForm />} />
            <Route path="donors/:id" element={<DonorProfile />} />
            <Route path="donors/edit/:id" element={<DonorForm />} />
            <Route path="donations" element={<Donations />} />
            <Route path="donations/new" element={<DonationForm />} />
            <Route path="donations/:id" element={<DonationProfile />} />
            <Route path="donations/edit/:id" element={<DonationForm />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventProfile />} />
            <Route path="finances" element={<Finances />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
  // In your app's entry point (main.jsx or App.jsx)
);
}
export default App;
