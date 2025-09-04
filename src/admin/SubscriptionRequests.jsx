// admin/SubscriptionRequests.jsx
import React, { useState, useEffect } from "react";
import { http } from "../api/http";
import { buildFileUrl } from "../config/api";

const SubscriptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await http.get("/admin/subscription-requests");

      // فلترة الطلبات قيد المراجعة فقط
      const pending = (res.data || []).filter(
        (req) => req.status === "قيد المراجعة"
      );
      setRequests(pending);
    } catch (err) {
      console.error("خطأ في جلب الطلبات:", err);
      setError("❌ تعذر تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const res = await http.post(`/admin/subscription-requests/${id}/approve`);

      setMessage("✅ تم قبول الطلب بنجاح! تم إرسال إشعار للمستخدم.");
      setError("");
      fetchRequests();

      // إخفاء الرسالة بعد 5 ثواني
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("خطأ في قبول الطلب:", err);
      setError(err.response?.data?.message || "❌ خطأ في قبول الطلب");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("سبب الرفض (اختياري):");

    setProcessingId(id);
    try {
      const res = await http.post(`/admin/subscription-requests/${id}/reject`, {
        reason: reason || ""
      });

      setMessage("✅ تم رفض الطلب. تم إرسال إشعار للمستخدم.");
      setError("");
      fetchRequests();

      // إخفاء الرسالة بعد 5 ثواني
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("خطأ في رفض الطلب:", err);
      setError(err.response?.data?.message || "❌ خطأ في رفض الطلب");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="text-center">⏳ جاري تحميل الطلبات...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">
          مراجعة طلبات الاشتراك
        </h1>
        {requests.length > 0 && (
          <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-2 rounded-lg">
            <span className="animate-pulse">🔔</span>
            <span className="font-medium">{requests.length} طلب جديد يحتاج مراجعة</span>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 text-center text-green-600 font-medium">{message}</div>
      )}
      {error && (
        <div className="mb-4 text-center text-red-600 font-medium">{error}</div>
      )}

      {requests.length === 0 ? (
        <p className="text-center text-gray-600">📭 لا توجد طلبات حالياً</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full section-card text-sm">
            <thead className="table-header">
              <tr>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">الخطة</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">إثبات الدفع</th>
                <th className="py-3 px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{req.name}</div>
                    <div className="text-sm text-gray-500">{req.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {req.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{req.amount} ريال</td>
                  <td className="py-3 px-4">{req.method}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(req.requestedAt || req.date).toLocaleDateString("ar-SA", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {req.proofFile ? (
                      <a
                        href={buildFileUrl(req.proofFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        📄 عرض الإيصال
                      </a>
                    ) : (
                      <span className="text-gray-400">لا يوجد</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={processingId === req._id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {processingId === req._id ? '⏳' : '✅'} قبول
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={processingId === req._id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {processingId === req._id ? '⏳' : '❌'} رفض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionRequests;
