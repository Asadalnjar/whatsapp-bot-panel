import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    pendingSubscriptions: 0,
    totalGroups: 0,
    totalBroadcasts: 0
  });
  const [loading, setLoading] = useState(true);

  // 📌 جلب بيانات لوحة التحكم من الباك إند
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب الإحصائيات العامة
        const statsRes = await http.get("/admin/dashboard-stats");

        // جلب عدد الاشتراكات قيد المراجعة
        const subscriptionsRes = await http.get("/admin/subscriptions/pending");

        // جلب عدد طلبات الاشتراك الجديدة
        const requestsRes = await http.get("/admin/subscription-requests");
        const pendingRequests = requestsRes.data.filter(req => req.status === "قيد المراجعة").length;

        setStats({
          ...statsRes.data,
          pendingSubscriptions: subscriptionsRes.data.subscriptions?.length || 0,
          pendingRequests: pendingRequests
        });
        setLoading(false);
      } catch (error) {
        console.error("❌ خطأ في جلب بيانات لوحة التحكم:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-500">⏳ جارٍ تحميل البيانات...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">لوحة تحكم المشرف</h1>

      {/* ✅ شبكة البطاقات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="إجمالي المستخدمين" value={stats.totalUsers} color="blue" />
        <StatCard title="المستخدمين النشطين" value={stats.activeUsers} color="green" />
        <StatCard
          title="طلبات اشتراك جديدة"
          value={stats.pendingRequests}
          color="orange"
          onClick={() => navigate('/admin/subscription-requests')}
          clickable={true}
          urgent={stats.pendingRequests > 0}
        />
        <StatCard
          title="اشتراكات قيد المراجعة"
          value={stats.pendingSubscriptions}
          color="yellow"
          onClick={() => navigate('/admin/invoice-review')}
          clickable={true}
        />
        <StatCard title="إجمالي القروبات" value={stats.totalGroups} color="purple" />
        <StatCard title="إجمالي التنبيهات" value={stats.totalBroadcasts} color="red" />
      </div>
    </div>
  );
};

// ✅ بطاقة عرض إحصائية
const StatCard = ({ title, value, color, onClick, clickable = false, urgent = false }) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    red: "text-red-600"
  };

  const cardClasses = `section-card text-center ${
    clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
  } ${urgent ? 'ring-2 ring-orange-400 ring-opacity-50 animate-pulse' : ''}`;

  return (
    <div className={cardClasses} onClick={clickable ? onClick : undefined}>
      <div className="flex items-center justify-center">
        <h2 className={`text-3xl font-bold ${colorClasses[color] || ""}`}>{value}</h2>
        {urgent && value > 0 && (
          <span className="ml-2 text-orange-500 animate-bounce">🔔</span>
        )}
      </div>
      <p className="text-gray-700 mt-2">{title}</p>
      {clickable && (
        <p className="text-xs text-gray-400 mt-1">انقر للعرض</p>
      )}
      {urgent && value > 0 && (
        <p className="text-xs text-orange-600 mt-1 font-medium">يحتاج مراجعة فورية!</p>
      )}
    </div>
  );
};

export default AdminDashboard;
