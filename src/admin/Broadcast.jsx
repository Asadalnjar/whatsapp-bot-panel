import React, { useState, useEffect } from "react";
import { http } from "../api/http";

const Broadcast = () => {
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 جلب الرسائل السابقة من الباك إند عند تحميل الصفحة
  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await http.get("/admin/broadcast");

      // تحويل البيانات بالشكل المطلوب
      const formatted = res.data.map((msg) => ({
        id: msg._id,
        content: msg.message,
        date: new Date(msg.sentAt).toLocaleString("ar-EG")
      }));

      setSentMessages(formatted);
    } catch (error) {
      console.error("❌ فشل في جلب الرسائل:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 إرسال رسالة جديدة
  const handleSend = async () => {
    if (!message.trim()) {
      alert("⚠️ الرجاء كتابة رسالة");
      return;
    }

    try {
      setLoading(true);
      const res = await http.post(
        "/admin/broadcast",
        { message }
      );

      const newMsg = {
        id: res.data.broadcast._id,
        content: res.data.broadcast.message,
        date: new Date(res.data.broadcast.sentAt).toLocaleString("ar-EG")
      };

      setSentMessages([newMsg, ...sentMessages]);
      setMessage("");
      alert("✅ تم إرسال التنبيه بنجاح");
    } catch (error) {
      console.error("❌ فشل في إرسال الرسالة:", error);
      alert(error.response?.data?.message || "❌ حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        إرسال تنبيه جماعي
      </h1>

      {/* 📨 نموذج الإرسال */}
      <section className="section-card mb-8" aria-labelledby="broadcast-label">
        <label id="broadcast-label" className="sr-only">
          رسالة التنبيه الجماعي
        </label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالة التنبيه هنا..."
          className="textarea-input"
          aria-describedby="broadcast-desc"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className={`mt-4 w-full btn-primary ${
            !message.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-disabled={!message.trim()}
          aria-label="إرسال التنبيه الآن"
        >
          {loading ? "⏳ جاري الإرسال..." : "إرسال الآن"}
        </button>
      </section>

      {/* 🗂️ قائمة الرسائل السابقة */}
      <section
        className="section-card"
        aria-labelledby="sent-messages-label"
      >
        <h2
          id="sent-messages-label"
          className="text-lg font-semibold text-gray-800 mb-4"
        >
          آخر التنبيهات المرسلة
        </h2>
        {loading && sentMessages.length === 0 ? (
          <p className="text-gray-500">⏳ جاري التحميل...</p>
        ) : sentMessages.length === 0 ? (
          <p className="text-gray-600">لا توجد تنبيهات سابقة.</p>
        ) : (
          <ul className="space-y-3">
            {sentMessages.map((msg) => (
              <li key={msg.id} className="border-b pb-2 text-sm">
                <p className="text-gray-800 mb-1">{msg.content}</p>
                <p className="text-gray-500 text-xs">📅 {msg.date}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Broadcast;
