import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PricingPage from "./pages/PricingPage";
import PublicPage from "./pages/Publicpage";

import Overview from "./pages/dashboard/Overview";
import ShortenUrl from "./pages/dashboard/ShortenUrl";
import MyLinks from "./pages/dashboard/MyLinks";
import Analytics from "./pages/dashboard/Analytics";
import QRGenerator from "./pages/dashboard/QRGenerator";
import QRAnalytics from "./pages/dashboard/QRAnalytics";
import Pages from "./pages/dashboard/Pages";
import Settings from "./pages/dashboard/Settings";
import Pricing from "./pages/dashboard/Pricing";
import Admin from "./pages/dashboard/Admin";
import CustomDomains from "./pages/dashboard/CustomDomains";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/u/:pageId" element={<PublicPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="shorten" element={<ShortenUrl />} />
                <Route path="links" element={<MyLinks />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="qr" element={<QRGenerator />} />
                <Route path="qr-analytics/:id" element={<QRAnalytics />} />
                <Route path="pages" element={<Pages />} />
                <Route path="settings" element={<Settings />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="domains" element={<CustomDomains />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
