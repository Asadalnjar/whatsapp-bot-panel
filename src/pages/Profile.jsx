import React, { useState, useEffect } from "react";
import { http } from "../api/http";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

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

  // 📌 جلب بيانات الملف الشخصي
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // إذا لم يسجل الدخول
      return;
    }

    http
      .get("/user/profile")
      .then((res) => {
        setName(res.data.name || "");
        setPhone(res.data.phone || "");
        setEmail(res.data.email || "");
        setStatus(res.data.status || "");
        setRole(res.data.role || "");
        setCreatedAt(
          res.data.createdAt
            ? new Date(res.data.createdAt).toLocaleDateString("ar-EG")
            : ""
        );
      })
      .catch((err) => {
        console.error("خطأ في جلب الملف الشخصي:", err);
        setMessage("❌ حدث خطأ في تحميل البيانات");
        setMessageType("error");
      });
  }, [navigate]);

  // 📌 حفظ التعديلات
  const handleSave = () => {
    if (password && password !== confirmPassword) {
      setMessage("❌ كلمة المرور غير متطابقة");
      setMessageType("error");
      return;
    }

    http
      .put(
        "/user/profile",
        { name, phone, email, password }
      )
      .then(() => {
        setMessage("✅ تم حفظ التعديلات بنجاح");
        setMessageType("success");
        setPassword("");
        setConfirmPassword("");
      })
      .catch((err) => {
        console.error("خطأ أثناء الحفظ:", err);
        setMessage("❌ حدث خطأ أثناء الحفظ");
        setMessageType("error");
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">الملف الشخصي</h1>

      <div className="section-card w-full max-w-md mx-auto">
        {/* الاسم */}
        <FormField label="الاسم الكامل" type="text" value={name} onChange={setName} />

        {/* رقم الجوال */}
        <FormField label="رقم الجوال" type="text" value={phone} onChange={setPhone} />

        {/* البريد الإلكتروني */}
        <FormField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />

        {/* الحقول الثابتة */}
        <ReadOnlyField label="الحالة" value={status} />
        <ReadOnlyField label="نوع الحساب" value={role} />
        <ReadOnlyField label="تاريخ الإنشاء" value={createdAt} />

        {/* كلمة المرور */}
        <FormField label="كلمة المرور الجديدة (اختياري)" type="password" value={password} onChange={setPassword} />
        <FormField label="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={setConfirmPassword} />

        <button onClick={handleSave} className="btn-primary w-full">
          حفظ التعديلات
        </button>

        {/* الرسائل */}
        {message && (
          <p className={`mt-4 text-center text-sm ${messageType === "error" ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// 🛠 مكون إدخال البيانات
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

// 🛠 مكون عرض البيانات الثابتة
const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
    <p className="bg-gray-100 p-2 rounded">{value || "-"}</p>
  </div>
);

export default Profile;
