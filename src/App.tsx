import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import {AuthRedirectRoute} from '@/components/AuthRedirectRoute'
import {AuthRedirectRouteDashboard} from '@/components/AuthRedirectRouteDashboard'
import { ProtectedRoute1 } from "@/components/ProtectedRouteDashboard";
import { ProtectedRoute2 } from "@/components/ProtectedRoutePayment";
import { TransitionSkeleton } from "@/components/ui/TransitionSkeleton.jsx";
import { lazy, useEffect } from "react";
import ScrollToTop from "@/components/ScrollToTop"
import SiteLayout from "@/components/landing/SiteLayout";
import { ViewTransitionProvider } from "@/components/ViewTransition";

// Pages (eager — landing / auth / 404)
import Index from "./pages/Index1";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import VerifyDonation from "./pages/VerifyDonation";
import Payment from "./pages/Payment";
import DonationSuccess from "./pages/DonationSuccess";
import DonationFailed from "./pages/DonationFailure";
import Receipt from "./pages/Receipt";
import Events1 from "@/pages/Events";
import About from "@/pages/About";
import Contact from "@/pages/Contact";


// Dashboard (layout is eager — small shell; page content is lazy)
import Layout from "./lenis";
import DashboardLayout from "./layouts/DashboardLayout";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Families = lazy(() => import("./pages/dashboard/Families"));
const FamilyProfile = lazy(() => import("./pages/dashboard/FamilyProfile"));
const FamilyForm = lazy(() => import("./pages/dashboard/FamilyForm"));
const Donors = lazy(() => import("./pages/dashboard/Donors"));
const DonorProfile = lazy(() => import("./pages/dashboard/DonorProfile"));
const DonorForm = lazy(() => import("./pages/dashboard/DonorForm"));
const Donations = lazy(() => import("./pages/dashboard/Donations"));
const DonationProfile = lazy(() => import("./pages/dashboard/DonationProfile"));
const DonationForm = lazy(() => import("./pages/dashboard/DonationForm"));
const Campaigns = lazy(() => import("./pages/dashboard/Campaigns"));
const Events = lazy(() => import("./pages/dashboard/Events"));
const EventProfile = lazy(() => import("./pages/dashboard/EventProfile"));
const Finances = lazy(() => import("./pages/dashboard/Finances"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const ReportsAnalytics = lazy(() => import("./pages/dashboard/Reports2_0"));


const App = () => {
  useEffect(() => {
  fetch('/api').catch(() => {}); // wake up render
  }, [])

  return (
  // In your app's entry point (main.jsx or App.jsx)
  <Layout>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TransitionSkeleton>
            <ScrollToTop />
            
            <Routes>
               <Route element={<ViewTransitionProvider><SiteLayout /> </ViewTransitionProvider>}>

                  <Route path="/" element={<Index />} />
                  <Route path="/events" element={<Events1 />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
              
               </Route>

              {/* Public routes */}
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
              <Route path="/verify-donation/:token" element={<VerifyDonation />} />
              <Route path="/donation-success" element={<DonationSuccess />} />
              <Route path="/donation-failure" element={<DonationFailed />} />
              <Route path="/receipt/:txRef" element={<Receipt />} />
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute2>
                    <Payment />
                  </ProtectedRoute2>
                } 
              />

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
          </TransitionSkeleton>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </Layout>
  // In your app's entry point (main.jsx or App.jsx)
);
}
export default App;
