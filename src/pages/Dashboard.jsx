import React, { useState, useEffect } from "react";
import http from "../api/http";

const Dashboard = () => {
  const [stats, setStats] = useState({
    userGroups: 0,
    activeGroups: 0,
    latestBilling: null
  });

  const [latestNotifications, setLatestNotifications] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 جلب بيانات لوحة التحكم من الباك إند
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await http.get("/user/dashboard-stats");

        // إحصائيات
        setStats({
          userGroups: res.data.userGroups || 0,
          activeGroups: res.data.activeGroups || 0,
          latestBilling: res.data.latestBilling || null
        });

        // إشعارات حديثة
        setLatestNotifications(res.data.latestNotifications || []);

        // جلب آخر الانتهاكات
        const violationsRes = await http.get("/user/violations?limit=5");
        setViolations(violationsRes.data.violations || []);

      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">⏳ جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* عنوان الصفحة الاحترافي */}
        <div className="relative text-center mb-12">
          {/* تأثير الخلفية */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl relative">
              <span className="text-4xl">📊</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>

            <h1 className="title-glow text-5xl md:text-6xl lg:text-7xl font-bold mb-4" data-text="لوحة التحكم">
              لوحة التحكم
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              نظرة شاملة على أداء البوت والإحصائيات المتقدمة مع تحليلات في الوقت الفعلي
            </p>

            {/* مؤشرات سريعة */}
            <div className="flex justify-center items-center mt-6 space-x-6 space-x-reverse">
              <div className="flex items-center text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-semibold">النظام يعمل</span>
              </div>
              <div className="flex items-center text-blue-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-semibold">متصل</span>
              </div>
            </div>
          </div>
        </div>

        {/* إحصائيات المستخدم المحسنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <StatCard
            title="عدد القروبات"
            value={stats.userGroups}
            color="blue"
            trend="+12%"
            description="إجمالي المجموعات المسجلة"
          />
          <StatCard
            title="القروبات المحمية"
            value={stats.activeGroups}
            color="green"
            trend="+8%"
            description="المجموعات النشطة حالياً"
          />
          <StatCard
            title="خطة الاشتراك"
            value={stats.latestBilling ? stats.latestBilling.plan : "مجاني"}
            color="purple"
            trend="نشط"
            description="الخطة الحالية"
          />
        </div>

        {/* قسم المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* آخر الإشعارات */}
          <div className="glass-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-xl text-white">🔔</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">آخر الإشعارات</h2>
                <p className="text-gray-600">التحديثات والتنبيهات الحديثة</p>
              </div>
            </div>

            {latestNotifications.length > 0 ? (
              <div className="space-y-4">
                {latestNotifications.map((n) => (
                  <div key={n._id} className="bg-white/50 p-4 rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-300">
                    <p className="text-gray-800 font-medium mb-2">{n.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span>
                      {new Date(n.sentAt).toLocaleString("ar-EG")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📭</span>
                </div>
                <p className="text-gray-500 font-medium">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>

          {/* آخر الانتهاكات */}
          <div className="glass-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-xl text-white">⚠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">آخر الانتهاكات</h2>
                <p className="text-gray-600">المخالفات والتنبيهات الأمنية</p>
              </div>
            </div>

            {violations.length > 0 ? (
              <div className="space-y-4">
                {violations.map((v) => (
                  <div key={v._id} className="bg-red-50/50 p-4 rounded-xl border border-red-100 hover:bg-red-50/70 transition-all duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-gray-800 font-medium">
                        📌 {v.detectedWord ? `كلمة محظورة: ${v.detectedWord}` : v.reason}
                      </p>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        {v.action}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4 space-x-reverse">
                      <span>🏢 {v.groupName || 'غير محدد'}</span>
                      <span>📅 {new Date(v.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-gray-500 font-medium">لا توجد انتهاكات حالياً</p>
                <p className="text-sm text-gray-400 mt-1">النظام يعمل بشكل مثالي</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🛠 مكون بطاقة الإحصائيات الاحترافي
const StatCard = ({ title, value, color, trend, description }) => {
  const gradientClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };

  const iconClasses = {
    blue: "📊",
    green: "🛡️",
    orange: "💳",
    red: "⚠️",
    purple: "👥"
  };

  const bgClasses = {
    blue: "from-blue-50 to-blue-100",
    green: "from-green-50 to-green-100",
    orange: "from-orange-50 to-orange-100",
    red: "from-red-50 to-red-100",
    purple: "from-purple-50 to-purple-100"
  };

  return (
    <div className="group relative">
      {/* تأثير التوهج */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[color]} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

      <div className={`relative bg-gradient-to-br ${bgClasses[color]} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-white/50 backdrop-blur-sm`}>
        {/* الأيقونة */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-16 h-16 bg-gradient-to-r ${gradientClasses[color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-2xl text-white">{iconClasses[color]}</span>
          </div>

          {/* مؤشر الاتجاه */}
          {trend && (
            <div className={`px-3 py-1 bg-gradient-to-r ${gradientClasses[color]} text-white text-sm font-semibold rounded-full shadow-md`}>
              {trend}
            </div>
          )}
        </div>

        {/* القيمة */}
        <div className="mb-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2 group-hover:scale-105 transition-transform duration-300">
            {value}
          </h2>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* خط التقدم التزييني */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradientClasses[color]} rounded-full transform origin-left scale-x-75 group-hover:scale-x-100 transition-transform duration-700`}></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
