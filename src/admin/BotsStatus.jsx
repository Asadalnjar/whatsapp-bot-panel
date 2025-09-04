import React, { useState, useEffect } from "react";
import { http } from "../api/http";

const BotsStatus = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 📌 جلب بيانات البوتات من الباك إند
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("❌ لا يوجد توكن، قم بتسجيل الدخول أولاً");
          setLoading(false);
          return;
        }

        const res = await http.get("/admin/bots");

        setBots(res.data);
      } catch (error) {
        console.error("❌ خطأ في جلب البوتات:", error);
        setMessage("❌ فشل في جلب بيانات البوتات");
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  // 📌 إعادة تشغيل بوت
  const handleRestart = async (id) => {
    if (!window.confirm("هل تريد إعادة تشغيل هذا البوت؟")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await http.post(`/admin/bots/restart/${id}`, {});

      setMessage(res.data.message || "✅ تم إعادة التشغيل بنجاح");

      // تحديث الحالة في الواجهة
      setBots((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, status: "متصل", lastSeen: "الآن" }
            : b
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("❌ فشل في إعادة تشغيل البوت");
    }
  };

  // 📌 إيقاف بوت
  const handleStop = async (id) => {
    if (!window.confirm("هل تريد إيقاف هذا البوت؟")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await http.post(`/admin/bots/stop/${id}`, {});

      setMessage(res.data.message || "✅ تم إيقاف البوت");

      // تحديث الحالة في الواجهة
      setBots((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, status: "متوقف", lastSeen: new Date().toLocaleString("ar-EG") }
            : b
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("❌ فشل في إيقاف البوت");
    }
  };

  if (loading) {
    return <p className="p-4">⏳ جاري تحميل البيانات...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        مراقبة الجلسات والبوتات
      </h1>

      {message && (
        <div className="mb-4 text-center text-sm text-blue-600">{message}</div>
      )}

      <div className="overflow-x-auto">
        <table
          className="min-w-full section-card text-sm"
          aria-label="مراقبة الجلسات"
        >
          <thead className="table-header">
            <tr>
              <th className="py-3 px-4 text-right">رقم المستخدم</th>
              <th className="py-3 px-4 text-right">حالة الجلسة</th>
              <th className="py-3 px-4 text-right">عدد الجروبات</th>
              <th className="py-3 px-4 text-right">آخر نشاط</th>
              <th className="py-3 px-4 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {bots.length > 0 ? (
              bots.map((bot) => (
                <tr key={bot._id} className="border-t">
                  <td className="py-2 px-4">{bot.userPhone}</td>
                  <td
                    className={`py-2 px-4 font-medium ${
                      bot.status === "متصل"
                        ? "badge-success"
                        : bot.status === "بانتظار QR"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {bot.status}
                  </td>
                  <td className="py-2 px-4">{bot.groupsCount}</td>
                  <td className="py-2 px-4">{bot.lastSeen}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleRestart(bot._id)}
                        className="btn-secondary"
                      >
                        🔄 إعادة تشغيل
                      </button>
                      <button
                        onClick={() => handleStop(bot._id)}
                        className="btn-danger"
                      >
                        ⛔ إيقاف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-red-500"
                >
                  🚫 لا يوجد أي بوتات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BotsStatus;
