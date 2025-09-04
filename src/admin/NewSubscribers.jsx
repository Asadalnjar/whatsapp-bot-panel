import React, { useState, useEffect } from 'react';
import { http } from '../api/http';

const NewSubscribers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 جلب الطلبات من السيرفر
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await http.get("/admin/new-subscribers");

      // تحويل البيانات للتنسيق المطلوب
      const formatted = res.data.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        requestedAt: new Date(user.createdAt).toLocaleDateString("ar-EG")
      }));

      setPendingUsers(formatted);
    } catch (error) {
      console.error("❌ فشل في جلب الطلبات", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 الموافقة على الطلب
  const handleApprove = async (id) => {
    try {
      await http.put(`/admin/new-subscribers/approve/${id}`, {});

      setPendingUsers(prev => prev.filter((u) => u.id !== id));
      alert("✅ تم تفعيل الاشتراك بنجاح");
    } catch (error) {
      console.error("❌ فشل في الموافقة على الطلب", error);
      alert("❌ حدث خطأ أثناء التفعيل");
    }
  };

  // 📌 رفض الطلب
  const handleReject = async (id) => {
    if (window.confirm("هل تريد رفض هذا الطلب؟")) {
      try {
        await http.put(`/admin/new-subscribers/reject/${id}`, {});

        setPendingUsers(prev => prev.filter((u) => u.id !== id));
        alert("❌ تم رفض الطلب");
      } catch (error) {
        console.error("❌ فشل في رفض الطلب", error);
        alert("❌ حدث خطأ أثناء الرفض");
      }
    }
  };

  if (loading) {
    return <p className="text-gray-600">⏳ جاري تحميل الطلبات...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-6">طلبات الاشتراك الجديدة</h1>

      {pendingUsers.length === 0 ? (
        <p className="text-gray-600">لا توجد طلبات جديدة حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full bg-white rounded shadow overflow-hidden"
            aria-label="جدول طلبات الاشتراك"
          >
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="py-3 px-4 text-right">الاسم</th>
                <th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-right">رقم الجوال</th>
                <th className="py-3 px-4 text-right">تاريخ الطلب</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} className="border-t text-sm">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.phone}</td>
                  <td className="py-2 px-4">{user.requestedAt}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="btn-primary text-sm"
                      >
                        ✅ تفعيل
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="btn-danger text-sm"
                      >
                        ❌ رفض
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

export default NewSubscribers;
