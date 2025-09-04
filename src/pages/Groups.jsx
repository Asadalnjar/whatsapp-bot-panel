// src/pages/Groups.jsx
import React, { useEffect, useState } from "react";
import http from "../api/http";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [testText, setTestText] = useState("مرحباً! هذا اختبار من البوت 🤖");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await http.get("/wa/groups/sync");
      setGroups(data?.groups || []);
    } catch (err) {
      console.error("❌ فشل في جلب القروبات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // انضمام برابط دعوة
  const joinByLink = async () => {
    if (!inviteLink.trim()) return;
    setLoading(true);
    try {
      await http.post("/wa/groups/join", { inviteLink: inviteLink.trim() });
      setInviteLink("");
      await fetchGroups();
      alert("تم الانضمام بنجاح ✅");
    } catch (e) {
      console.error(e);
      alert("تعذر الانضمام. تأكد من الرابط.");
    } finally {
      setLoading(false);
    }
  };

  // إرسال اختبار
  const sendTest = async (groupId) => {
    try {
      await http.post("/wa/groups/send", { jid: groupId, text: testText });
      alert("تم الإرسال ✅");
    } catch (e) {
      console.error(e);
      alert("فشل الإرسال");
    }
  };

  // مغادرة قروب
  const leave = async (groupId) => {
    if (!window.confirm("متأكد تريد مغادرة هذا القروب؟")) return;
    try {
      await http.post("/wa/groups/leave", { jid: groupId });
      await fetchGroups();
    } catch (e) {
      console.error(e);
      alert("فشل المغادرة");
    }
  };

  // تفعيل/إيقاف حماية القروب
  const toggleGroupProtection = async (groupId, currentStatus) => {
    try {
      const response = await http.put(`/user/groups/${encodeURIComponent(groupId)}/protection`, {});

      if (response.data.success) {
        // تحديث حالة القروب في القائمة
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, isProtected: !currentStatus } : g))
        );
        alert(response.data.message || "تم تحديث حالة الحماية بنجاح ✅");
      }
    } catch (e) {
      console.error("❌ فشل في تغيير حالة الحماية:", e);
      alert(e.response?.data?.message || "حدث خطأ في تحديث حالة الحماية");
    }
  };

  if (loading) return <p className="text-center text-gray-500">⏳ جاري تحميل القروبات...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
        إدارة القروبات
      </h1>

      {/* شريط أدوات */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mb-6">
        <button onClick={fetchGroups} className="btn-secondary sm:w-auto">🔄 مزامنة القروبات</button>
        <div className="flex-1">
          <label className="block text-sm mb-1">رابط دعوة القروب</label>
          <input
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/XXXXXXXXXXXXXXX"
            className="input w-full"
          />
        </div>
        <button onClick={joinByLink} className="btn-primary sm:w-auto">➕ انضمام بالرابط</button>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">نص اختبار للإرسال</label>
        <input
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="input w-full"
        />
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد قروبات حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="section-card p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {group.name || group.subject || "مجموعة بدون اسم"}
              </h2>

              <p className="text-gray-600 mb-1">
                JID: <span className="font-mono text-sm">{group.id}</span>
              </p>
              <p className="text-gray-600 mb-1">عدد الأعضاء: {group.size ?? "غير معروف"}</p>
              <p className="text-gray-600 mb-1">
                وضع الإعلانات فقط: {group.isAnnounce ? "نعم" : "لا"}
              </p>
              <p className="text-gray-600 mb-4">
                حالة الحماية:{" "}
                <span className={`font-bold ${group.isProtected ? "text-green-600" : "text-red-500"}`}>
                  {group.isProtected ? "مفعّلة" : "غير مفعّلة"}
                </span>
              </p>

              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => sendTest(group.id)}>✉️ إرسال اختبار</button>
                <button className="btn-danger" onClick={() => leave(group.id)}>🚪 مغادرة</button>
                <button
                  className={group.isProtected ? "btn-danger" : "btn-primary"}
                  onClick={() => toggleGroupProtection(group.gid || group.id, group.isProtected)}
                >
                  {group.isProtected ? "إيقاف الحماية" : "تفعيل الحماية"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

