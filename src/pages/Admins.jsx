import React, { useState } from 'react';

const Admins = () => {
  const [admins, setAdmins] = useState([
    { id: 1, phone: '0501234567', role: 'عرض فقط' },
    { id: 2, phone: '0539876543', role: 'طرد وحذف' },
  ]);

  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('عرض فقط');

  const handleAddAdmin = () => {
    if (newPhone.trim() !== '') {
      const newAdmin = {
        id: Date.now(),
        phone: newPhone,
        role: newRole,
      };
      setAdmins([...admins, newAdmin]);
      setNewPhone('');
      setNewRole('عرض فقط');
    }
  };

  const handleDeleteAdmin = (id) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6">إدارة المشرفين الفرعيين</h1>

      {/* ✅ إضافة مشرف جديد */}
      <div className="section-card max-w-2xl mx-auto mb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">إضافة مشرف</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="رقم الجوال"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 input"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="input"
          >
            <option value="عرض فقط">عرض فقط</option>
            <option value="حذف">حذف</option>
            <option value="طرد">طرد</option>
            <option value="طرد وحذف">طرد وحذف</option>
          </select>
          <button
            onClick={handleAddAdmin}
            className="btn-primary sm:w-auto w-full"
          >
            إضافة
          </button>
        </div>
      </div>

      {/* ✅ قائمة المشرفين */}
      <div className="section-card max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">قائمة المشرفين</h2>
        <ul className="space-y-3">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
            >
              <div>
                <p className="text-gray-800 font-medium">{admin.phone}</p>
                <p className="text-sm text-gray-600">الصلاحية: {admin.role}</p>
              </div>
              <button
                onClick={() => handleDeleteAdmin(admin.id)}
                className="btn-danger px-3 py-1 text-sm"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admins;
