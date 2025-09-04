import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* ✅ شريط علوي يظهر فقط في الجوال */}
      <div className="md:hidden bg-green-600 text-white flex justify-between items-center p-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold">لوحة تحكم المشرف</h2>
      </div>

      {/* ✅ الشريط الجانبي */}
      <aside
        className={`w-64 bg-gray-800 text-white p-5 space-y-6 ${
          sidebarOpen ? 'block' : 'hidden'
        } md:block`}
      >
        <h2 className="text-2xl font-bold mb-6 text-green-400">إدارة النظام</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/admin/dashboard" className="hover:text-green-300 transition-colors duration-200">
            لوحة التحكم
          </Link>
          <Link to="/admin/users" className="hover:text-green-300 transition-colors duration-200">
            المشتركين
          </Link>
          <Link to="/admin/new-subscribers" className="hover:text-green-300 transition-colors duration-200">
            طلبات الاشتراك الجديدة
          </Link>
          <Link to="/admin/subscription-requests" className="hover:text-green-300 transition-colors duration-200">
            طلبات الاشتراك
          </Link>
          <Link to="/admin/billing" className="hover:text-green-300 transition-colors duration-200">
            سجل الاشتراكات والفواتير
          </Link>
          <Link to="/admin/bots" className="hover:text-green-300 transition-colors duration-200">
            الجلسات والبوتات
          </Link>
          <Link to="/admin/broadcast" className="hover:text-green-300 transition-colors duration-200">
            تنبيهات جماعية
          </Link>
          <Link to="/admin/settings" className="hover:text-green-300 transition-colors duration-200">
            إعدادات النظام
          </Link>
          <Link to="/admin/profile" className="hover:text-green-300 transition-colors duration-200">
            الملف الشخصي
          </Link>
        </nav>
      </aside>

      {/* ✅ المحتوى الرئيسي */}
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
