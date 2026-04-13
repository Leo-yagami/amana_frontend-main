import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Beneficiaries from "./pages/dashboard/Beneficiaries";
import BeneficiaryProfile from "./pages/dashboard/BeneficiaryProfile";
import BeneficiaryForm from "./pages/dashboard/BeneficiaryForm";
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
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import VerifyDonation from "./pages/VerifyDonation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-donation/:token" element={<VerifyDonation />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="families" element={<Families />} />
                  <Route path="families/new" element={<FamilyForm />} />
                  <Route path="families/:id" element={<FamilyProfile />} />
                  <Route path="families/:id/edit" element={<FamilyForm />} />
                  <Route path="beneficiaries" element={<Beneficiaries />} />
                  <Route path="beneficiaries/new" element={<BeneficiaryForm />} />
                  <Route path="beneficiaries/:id" element={<BeneficiaryProfile />} />
                  <Route path="beneficiaries/:id/edit" element={<BeneficiaryForm />} />
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
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
