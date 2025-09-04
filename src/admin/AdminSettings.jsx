import React, { useState, useEffect } from "react";
import { http } from "../api/http";

const AdminSettings = () => {
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [loading, setLoading] = useState(true);

  // 📌 جلب الإعدادات عند التحميل
  useEffect(() => {
    http
      .get("/admin/settings")
      .then((res) => {
        const data = res.data;
        setBannedWords(data.bannedWords || []);
        setSupportEmail(data.supportEmail || "");
        setSupportPhone(data.supportPhone || "");
        setOpenAiKey(data.openAiKey || "");
        setPaypalClientId(data.paypalClientId || "");
      })
      .catch((err) => {
        console.error(err);
        alert("❌ فشل في جلب الإعدادات");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddWord = () => {
    const trimmedWord = newWord.trim();
    if (!trimmedWord) return alert("⚠️ الرجاء إدخال كلمة صحيحة.");
    if (bannedWords.includes(trimmedWord))
      return alert("⚠️ هذه الكلمة موجودة بالفعل في القائمة.");
    setBannedWords([...bannedWords, trimmedWord]);
    setNewWord("");
  };

  const handleDeleteWord = (word) => {
    setBannedWords(bannedWords.filter((w) => w !== word));
  };

  // 📌 حفظ الإعدادات
  const handleSave = () => {
    http
      .put(
        "/admin/settings",
        {
          bannedWords,
          supportEmail,
          supportPhone,
          openAiKey,
          paypalClientId,
        }
      )
      .then(() => {
        alert("✅ تم حفظ إعدادات النظام بنجاح");
      })
      .catch((err) => {
        console.error(err);
        alert("❌ فشل في حفظ الإعدادات");
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  if (loading) {
    return <p className="text-center mt-6">⏳ جارٍ تحميل الإعدادات...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">إعدادات النظام</h1>

      {/* كلمات ممنوعة */}
      <section
        className="section-card mb-10"
        aria-labelledby="banned-words-heading"
      >
        <h2 id="banned-words-heading" className="section-title">
          الكلمات المحظورة العامة
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="أدخل كلمة"
            className="input flex-1"
            aria-label="أدخل كلمة جديدة للحظر"
          />
          <button
            onClick={handleAddWord}
            className="btn btn-primary"
            aria-label="إضافة كلمة جديدة للحظر"
          >
            إضافة
          </button>
        </div>

        <ul className="space-y-2" aria-live="polite">
          {bannedWords.map((word, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
            >
              <span>{word}</span>
              <button
                onClick={() => handleDeleteWord(word)}
                className="btn btn-danger text-sm"
                aria-label={`حذف الكلمة ${word}`}
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* إعدادات الاتصال ومفاتيح API */}
      <section
        className="section-card space-y-4"
        aria-labelledby="contact-settings-heading"
      >
        <h2 id="contact-settings-heading" className="section-title">
          إعدادات الاتصال
        </h2>

        <input
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          className="input"
          placeholder="بريد الدعم الفني"
          aria-label="بريد الدعم الفني"
        />

        <input
          type="tel"
          value={supportPhone}
          onChange={(e) => setSupportPhone(e.target.value)}
          className="input"
          placeholder="رقم الدعم الفني"
          aria-label="رقم الدعم الفني"
        />

        <h2 className="section-title mt-6">مفاتيح API</h2>

        <input
          type="text"
          value={openAiKey}
          onChange={(e) => setOpenAiKey(e.target.value)}
          className="input"
          placeholder="OpenAI API Key"
          aria-label="مفتاح API الخاص بـ OpenAI"
        />

        <input
          type="text"
          value={paypalClientId}
          onChange={(e) => setPaypalClientId(e.target.value)}
          className="input"
          placeholder="PayPal Client ID"
          aria-label="معرف عميل PayPal"
        />

        <button
          onClick={handleSave}
          className="btn btn-primary w-full mt-6"
          aria-label="حفظ إعدادات النظام"
        >
          حفظ التعديلات
        </button>
      </section>
    </div>
  );
};

export default AdminSettings;
