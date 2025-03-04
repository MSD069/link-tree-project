import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import LoginPage from './AuthPages/LoginPage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from './AuthPages/SignupForm';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import LinkPage from './DashboardPages/LinkPage';
import Appearance from './DashboardPages/AppearancePage';
import Analytics from './DashboardPages/Analytics';
import Settings from './DashboardPages/SettingsPage';
import ProfileView from './DashboardPages/ProfileView';
import { SettingsProvider } from './context/SettingsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const categoryCompleted = localStorage.getItem('categoryCompleted');
  if (!token) return <Navigate to="/login" replace />;
  if (!categoryCompleted) return <Navigate to="/about" replace />;
  return children;
};

const CategoryProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const categoryCompleted = localStorage.getItem('categoryCompleted');
  if (!token) return <Navigate to="/login" replace />;
  if (categoryCompleted) return <Navigate to="/dashboard" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const categoryCompleted = localStorage.getItem('categoryCompleted');
  if (token && categoryCompleted) return <Navigate to="/dashboard" replace />;
  if (token && !categoryCompleted && children.type !== LoginPage) return <Navigate to="/about" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
          <Route path="/about" element={<CategoryProtectedRoute><Categories /></CategoryProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<LinkPage />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/profile/:userId" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
