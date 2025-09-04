import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

// مكون رابط التنقل المخصص
const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`group relative flex items-center p-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white shadow-lg backdrop-blur-sm border border-white/20'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {/* تأثير التوهج للعنصر النشط */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
      )}

      <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
          : 'bg-white/10 group-hover:bg-white/20'
      }`}>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="relative z-10">
        <span className="font-semibold">{label}</span>
        {isActive && (
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mt-1 rounded-full"></div>
        )}
      </div>

      {/* مؤشر الجانب للعنصر النشط */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
      )}
    </Link>
  );
};

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* شريط علوي محدث للهاتف */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center p-4 shadow-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
            <span className="text-lg">🤖</span>
          </div>
          <h2 className="text-lg font-bold">واتساب بوت</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* القائمة الجانبية الاحترافية */}
      <aside className={`relative w-80 p-8 shadow-2xl backdrop-blur-xl
        ${isOpen ? 'block' : 'hidden'} md:block transition-all duration-500 ease-in-out`}
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}>

        {/* تأثير الخلفية المتحركة */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* شعار وعنوان محسن */}
        <div className="relative z-10 hidden md:block mb-10">
          <div className="flex items-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">واتساب بوت</h2>
              <p className="text-blue-300 text-sm font-medium">لوحة التحكم الذكية</p>
            </div>
          </div>

          {/* خط فاصل متوهج */}
          <div className="relative mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-blue-400 to-purple-500 blur-sm"></div>
          </div>
        </div>
        <nav className="relative z-10 flex flex-col gap-3">
          <NavLink to="/dashboard" icon="🏠" label="الصفحة الرئيسية" />
          <NavLink to="/groups" icon="👥" label="إدارة القروبات" />
          <NavLink to="/protection" icon="🛡️" label="الحماية والفلترة" />
          <NavLink to="/settings" icon="⚙️" label="الإعدادات العامة" />
          <NavLink to="/qr-session" icon="📱" label="ربط الجلسة" />
          <NavLink to="/subscription" icon="💳" label="الاشتراك" />
          <NavLink to="/notifications" icon="🔔" label="الإشعارات" />
          <NavLink to="/profile" icon="👤" label="الملف الشخصي" />

          {/* فاصل */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

          {/* روابط المساعدة */}
          <NavLink to="/mobile-help" icon="📚" label="دليل الربط للجوال" />
        </nav>

        {/* معلومات المستخدم في الأسفل */}
        
      </aside>

      {/* المحتوى الرئيسي المحدث */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
