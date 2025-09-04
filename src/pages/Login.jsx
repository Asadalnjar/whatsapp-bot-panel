import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { http } from '../api/http';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 👈 افتراضيًا "مستخدم"
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تنظيف رقم الجوال من المسافات
    const cleanedPhone = phone.trim();

    try {
      const res = await http.post(
        "/auth/login",
        { phone: cleanedPhone, password, role } // ⬅️ إرسال الدور أيضًا
      );

      // تخزين بيانات الجلسة
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("userId", res.data.user.id);

      // تخزين معلومات الاشتراك إذا كانت متوفرة
      if (res.data.subscription) {
        localStorage.setItem("subscription", JSON.stringify(res.data.subscription));
      }

      // التوجيه حسب الدور وحالة المستخدم
      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // للمستخدمين العاديين، التحقق من حالة الحساب والاشتراك
        const user = res.data.user;
        const subscription = res.data.subscription;

        if (user.status === 'pending') {
          // المستخدمين الجدد يذهبون لصفحة الاشتراك
          navigate("/subscription");
        } else if (user.status === 'active') {
          if (!subscription || subscription.status !== 'active') {
            // مستخدمين نشطين بدون اشتراك نشط
            navigate("/subscription");
          } else {
            // مستخدمين نشطين مع اشتراك نشط
            navigate("/dashboard");
          }
        } else {
          // حالات أخرى (suspended, banned)
          alert("❌ حسابك غير مفعل. تواصل مع الإدارة.");
        }
      }
    } catch (err) {
      console.error("❌ خطأ في تسجيل الدخول:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "❌ حدث خطأ في تسجيل الدخول");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="login-card">

        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-primary">
          تسجيل الدخول
        </h2>

        {/* اختيار الدور */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            نوع الحساب
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input w-full"
          >
            <option value="user">مستخدم</option>
            <option value="admin">مشرف</option>
          </select>
        </div>

        <FormField
          label="رقم الجوال"
          type="text"
          value={phone}
          onChange={setPhone}
          placeholder="05xxxxxxxx"
        />

        <FormField
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="********"
        />

        <button type="submit" className="w-full btn-primary">
          دخول
        </button>

        {/* رابط للتسجيل */}
        <p className="text-center text-sm text-gray-600 mt-4">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            أنشئ حساب الآن
          </Link>
        </p>
      </form>
    </div>
  );
}

// مكون الحقل الموحد
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

export default Login;
