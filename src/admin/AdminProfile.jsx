// src/admin/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { http } from "../api/http";

const AdminProfile = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    http
      .get("/admin/profile")
      .then((res) => {
        setName(res.data.name);
        setPhone(res.data.phone);
        setEmail(res.data.email || "");
        setStatus(res.data.status || "");
        setRole(res.data.role || "");
        setCreatedAt(
          res.data.createdAt
            ? new Date(res.data.createdAt).toLocaleDateString("ar-EG")
            : ""
        );
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      setMessage("❌ كلمة المرور غير متطابقة");
      setMessageType("error");
      return;
    }

    http
      .put(
        "/admin/profile",
        { name, phone, email, password }
      )
      .then(() => {
        setMessage("✅ تم حفظ التعديلات بنجاح");
        setMessageType("success");
        setPassword("");
        setConfirmPassword("");
      })
      .catch(() => {
        setMessage("❌ حدث خطأ أثناء الحفظ");
        setMessageType("error");
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-6">الملف الشخصي للمشرف</h1>

      <div className="section-card w-full max-w-md mx-auto">
        <FormField label="الاسم الكامل" type="text" value={name} onChange={setName} />
        <FormField label="رقم الجوال" type="text" value={phone} onChange={setPhone} />
        <FormField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />

        {/* معلومات ثابتة */}
        <ReadOnlyField label="الحالة" value={status} />
        <ReadOnlyField label="نوع الحساب" value={role} />
        <ReadOnlyField label="تاريخ الإنشاء" value={createdAt} />

        {/* كلمة المرور */}
        <FormField label="كلمة المرور الجديدة (اختياري)" type="password" value={password} onChange={setPassword} />
        <FormField label="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={setConfirmPassword} />

        <button onClick={handleSave} className="btn-primary w-full">
          حفظ التعديلات
        </button>

        {message && (
          <p className={`mt-4 text-center text-sm ${messageType === "error" ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const FormField = ({ label, type, value, onChange }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-full"
    />
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
    <p className="bg-gray-100 p-2 rounded">{value || "-"}</p>
  </div>
);

export default AdminProfile;
