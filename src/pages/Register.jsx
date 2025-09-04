// src/pages/Register.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http } from "../api/http";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");         // ✅ البريد الإلكتروني
  const [phone, setPhone] = useState("");         // ✅ رقم الجوال كما يدخله المستخدم
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ========= Helpers =========
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  // تطبيع رقم الجوال للتنسيق الدولي المتوقع في كثير من الباك-إندات
  // أمثلة: 772292869  -> +967772292869
  //        0563713163 -> +966563713163
  const normalizePhone = (raw) => {
    const p = raw.replace(/\s|-/g, "").trim();
    if (!p) return p;

    if (p.startsWith("+")) return p; // بالفعل دولي

    // يبدأ بـ 7 (نمط يمني شائع)
    if (/^7\d{8,9}$/.test(p)) {
      // إن كان 9 خانات وبدأ بـ77..، نبقيه كما هو ونسبق +967
      return `+967${p}`;
    }

    // يبدأ بـ 05 (نمط سعودي محلي)
    if (/^05\d{8}$/.test(p)) {
      return `+966${p.slice(1)}`; // نحذف أول صفر
    }

    return p; // بدون تعديل إذا لم يطابق الأنماط السابقة
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تنظيف المدخلات
    const cleanedEmail = email.trim();
    const cleanedPhone = phone.trim();

    // التحقق من الحقول
    if (!name || !cleanedEmail || !cleanedPhone || !password || !confirmPassword) {
      showMessage("❌ الرجاء تعبئة جميع الحقول", "error");
      return;
    }

    // تحقق البريد الإلكتروني
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanedEmail)) {
      showMessage("❌ صيغة البريد الإلكتروني غير صحيحة", "error");
      return;
    }

    // تحقق مبدئي لرقم الجوال (يمني أو سعودي بصيغته المحلية أو الدولية)
    const phoneRegex = /^(\+9677\d{8}|\+9665\d{8}|7\d{8,9}|05\d{8})$/;
    if (!phoneRegex.test(cleanedPhone)) {
      showMessage("❌ رقم الجوال غير صحيح (يجب أن يكون رقم يمني أو سعودي)", "error");
      return;
    }

    // تطويل كلمة المرور
    if (password.length < 6) {
      showMessage("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }

    // تطابق كلمتي المرور
    if (password !== confirmPassword) {
      showMessage("❌ كلمة المرور غير متطابقة", "error");
      return;
    }

    // تطبيع الرقم قبل الإرسال
    const normalizedPhone = normalizePhone(cleanedPhone);

    try {
      setIsLoading(true);
      setMessage(""); // مسح أي رسالة سابقة

      // نرسل confirmPassword و passwordConfirm لضمان التوافق مع أي سكيمة في الباك-إند
      const payload = {
        name,
        email: cleanedEmail,
        phone: normalizedPhone,
        password,
        confirmPassword,
        passwordConfirm: confirmPassword,
      };

      const response = await http.post("/auth/register", payload);

      showMessage(
        "✅ تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول لإكمال عملية الاشتراك.",
        "success"
      );

      // حفظ معرف المستخدم الجديد (إن وُجد) مؤقتًا
      if (response?.data?.user?.id) {
        localStorage.setItem("newUserId", String(response.data.user.id));
      }

      // إعادة التوجيه لصفحة تسجيل الدخول
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      const status = error?.response?.status;
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "❌ حدث خطأ أثناء التسجيل";

      if (status === 429) {
        showMessage("❌ تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقًا.", "error");
      } else if (status === 400 || status === 422) {
        showMessage(errMsg || "❌ بيانات غير صحيحة", "error");
      } else {
        showMessage(errMsg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="login-card w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-primary">
          إنشاء حساب جديد
        </h2>

        <FormField
          label="الاسم الكامل"
          type="text"
          value={name}
          onChange={setName}
          placeholder="أدخل اسمك الكامل"
        />

        <FormField
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="example@email.com"
        />

        <FormField
          label="رقم الجوال"
          type="text"
          value={phone}
          onChange={setPhone}
          placeholder="مثال: 776xxxxxxx أو 05xxxxxxxx أو +9677xxxxxxxx"
        />

        <FormField
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="********"
        />

        <FormField
          label="تأكيد كلمة المرور"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="********"
        />

        <button type="submit" className="w-full btn-primary" disabled={isLoading}>
          {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              messageType === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-4">
          لديك حساب بالفعل؟{" "}
          <Link to="/" className="text-green-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
        <p>
          كلمة المرور يجب أن تكون 6 احرف كبيره وصغيره ورقم ورمز خاص
        </p>
      </form>
    </div>
  );
};

// ✅ مكوّن حقل إدخال موحّد
const FormField = ({ label, type, value, onChange, ...rest }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-full"
      {...rest}
    />
  </div>
);

export default Register;
