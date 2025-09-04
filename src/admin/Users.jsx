import React, { useState, useEffect } from 'react';
import { http } from '../api/http';

const Users = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // 📌 جلب قائمة المشتركين من الباك إند
  useEffect(() => {
    fetchUsers();
  }, []);

  // دالة لترجمة الحالة من الإنجليزية للعربية
  const translateStatus = (status) => {
    const statusMap = {
      'active': 'نشط',
      'suspended': 'موقوف',
      'pending': 'بانتظار التفعيل',
      'banned': 'محظور'
    };
    return statusMap[status] || status;
  };

  const fetchUsers = () => {
    http.get("/admin/users")
    .then(res => {
      setUsers(res.data);
    })
    .catch(err => {
      console.error("❌ خطأ في جلب المشتركين:", err);
    });
  };

  // 📌 تغيير حالة المستخدم (نشط / موقوف)
  const handleToggleStatus = (id, currentStatus) => {
    // تحويل الحالة من العربية إلى الإنجليزية للـ Backend
    const statusMap = {
      'active': 'suspended',
      'suspended': 'active',
      'pending': 'active',
      'banned': 'active'
    };

    const newBackendStatus = statusMap[currentStatus] || 'active';

    http.put(
      `/admin/users/${id}/status`,
      { status: newBackendStatus }
    )
    .then(() => {
      // تحديث الحالة في الواجهة
      setUsers(prev =>
        prev.map(u => u._id === id ? { ...u, status: newBackendStatus } : u)
      );
    })
    .catch(err => {
      console.error("❌ خطأ في تحديث حالة المستخدم:", err);
    });
  };

  // 📌 حذف مستخدم
  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      http.delete(`/admin/users/${id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u._id !== id));
      })
      .catch(err => {
        console.error("❌ خطأ في حذف المستخدم:", err);
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-6">إدارة المشتركين</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow overflow-hidden" aria-label="جدول المشتركين">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4 text-right">الاسم</th>
              <th className="py-3 px-4 text-right">رقم الجوال</th>
              <th className="py-3 px-4 text-right">الخطة</th>
              <th className="py-3 px-4 text-right">الحالة</th>
              <th className="py-3 px-4 text-right">تاريخ التسجيل</th>
              <th className="py-3 px-4 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-t text-sm">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.phone}</td>
                  <td className="py-2 px-4">{user.plan || "-"}</td>
                  <td className={`py-2 px-4 font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                    {translateStatus(user.status)}
                  </td>
                  <td className="py-2 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleToggleStatus(user._id, user.status)}
                        className="btn-secondary text-sm"
                      >
                        {user.status === 'active' ? '⛔ إيقاف' : '✅ تنشيط'}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn-danger text-sm"
                      >
                        ❌ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  لا يوجد مشتركين حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
