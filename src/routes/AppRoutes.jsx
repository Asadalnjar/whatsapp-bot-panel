import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Groups from '../pages/Groups';
import Settings from '../pages/Settings';
import Admins from '../pages/Admins';
import QrSession from '../pages/QrSession';
import Subscription from '../pages/Subscription';
import Profile from '../pages/Profile';
import Protection from '../pages/Protection';
import MainLayout from '../layouts/MainLayout';
import Register from '../pages/Register';
import Notifications from "../pages/Notifications";
import MobileInstructions from '../pages/MobileInstructions';

const AppRoutes = () => (
  <>
    {/* صفحة الدخول خارج الـ layout */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/mobile-help" element={<MobileInstructions />} />

    {/* باقي الصفحات داخل layout المستخدم */}
    <Route element={<MainLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admins" element={<Admins />} />
      <Route path="/qr-session" element={<QrSession />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/protection" element={<Protection />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  </>
);

export default AppRoutes;
