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

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<Categories />} />
          <Route path="/dashboard" element={<Dashboard />}>
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
