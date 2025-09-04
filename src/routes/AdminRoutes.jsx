import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

import AdminDashboard from '../admin/AdminDashboard';
import Users from '../admin/Users';
import NewSubscribers from '../admin/NewSubscribers';
import Billing from '../admin/Billing';
import BotsStatus from '../admin/BotsStatus';
import AdminSettings from '../admin/AdminSettings';
import Broadcast from '../admin/Broadcast';
import AdminProfile from '../admin/AdminProfile';
import SubscriptionRequests from '../admin/SubscriptionRequests'; // ✅ استيراد المكون الناقص
import InvoiceReview from '../pages/admin/InvoiceReview';

const AdminRoutes = () => (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="new-subscribers" element={<NewSubscribers />} />
    <Route path="billing" element={<Billing />} />
    <Route path="subscription-requests" element={<SubscriptionRequests />} /> {/* ✅ مسار جديد */}
    <Route path="invoice-review" element={<InvoiceReview />} />
    <Route path="bots" element={<BotsStatus />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="broadcast" element={<Broadcast />} />
    <Route path="profile" element={<AdminProfile />} />
  </Route>
);

export default AdminRoutes;
