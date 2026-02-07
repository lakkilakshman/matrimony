
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import RegistrationPage from '@/pages/RegistrationPage';
import BrowseProfilesPage from '@/pages/BrowseProfilesPage';
import ProfileDetailPage from '@/pages/ProfileDetailPage';
import SearchFilterPage from '@/pages/SearchFilterPage';
import UserProfilePage from '@/pages/UserProfilePage';
import EditProfilePage from '@/pages/EditProfilePage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminProfilesPage from '@/pages/AdminProfilesPage';
import AdminVerificationsPage from '@/pages/AdminVerificationsPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminFormFieldsPage from '@/pages/AdminFormFieldsPage';
import AdminPaymentSettingsPage from '@/pages/AdminPaymentSettingsPage';
import AdminPaymentsPage from '@/pages/AdminPaymentsPage';
import AdminEmailTemplatesPage from '@/pages/AdminEmailTemplatesPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import PricingPage from '@/pages/PricingPage';
import PaymentPage from '@/pages/PaymentPage';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-maroon text-xl">Loading...</p>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-maroon text-xl">Loading...</p>
    </div>;
  }

  return isAuthenticated && currentUser?.role === 'admin' ? children : <Navigate to="/admin-login" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Protected User Routes */}
      <Route path="/browse" element={
        <ProtectedRoute>
          <BrowseProfilesPage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <ProfileDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchFilterPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/edit-profile" element={
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/payment/:planId" element={
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsersPage />
        </AdminRoute>
      } />
      <Route path="/admin/profiles" element={
        <AdminRoute>
          <AdminProfilesPage />
        </AdminRoute>
      } />
      <Route path="/admin/verifications" element={
        <AdminRoute>
          <AdminVerificationsPage />
        </AdminRoute>
      } />
      <Route path="/admin/form-fields" element={
        <AdminRoute>
          <AdminFormFieldsPage />
        </AdminRoute>
      } />
      <Route path="/admin/payment-settings" element={
        <AdminRoute>
          <AdminPaymentSettingsPage />
        </AdminRoute>
      } />
      <Route path="/admin/settings" element={
        <AdminRoute>
          <AdminSettingsPage />
        </AdminRoute>
      } />
      <Route path="/admin/payments" element={
        <AdminRoute>
          <AdminPaymentsPage />
        </AdminRoute>
      } />
      <Route path="/admin/email-templates" element={
        <AdminRoute>
          <AdminEmailTemplatesPage />
        </AdminRoute>
      } />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
