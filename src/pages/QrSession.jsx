// src/pages/QrSession.jsx

import React, { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import QRCode from "qrcode";
import http from "../api/http";
import { API_URL } from "../config/api";
import MobileAlert from "../components/MobileAlert";

// كشف نوع الجهاز
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// كشف إذا كان المستخدم على iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// كشف إذا كان المستخدم على Android
const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export default function QrSession() {
  const [qrCode, setQrCode] = useState(null); // string | null (dataurl)
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("جاري تهيئة الاتصال...");
  const [connected, setConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState('auto'); // auto, qr, link, manual
  const [showInstructions, setShowInstructions] = useState(false);
  const socketRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  // جلب معلومات الجهاز من الخادم
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await http.get('/wa/device-info');
        if (response.data.success) {
          const { deviceInfo } = response.data;
          console.log('معلومات الجهاز:', deviceInfo);

          // تحديد طريقة الاتصال المناسبة
          if (connectionMethod === 'auto') {
            setConnectionMethod(deviceInfo.recommendations.primary);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب معلومات الجهاز:', error);
        // fallback للكشف المحلي
        if (connectionMethod === 'auto') {
          if (isMobile()) {
            setConnectionMethod('link');
          } else {
            setConnectionMethod('qr');
          }
        }
      }
    };

    fetchDeviceInfo();
  }, [connectionMethod]);

  // دالة لفتح WhatsApp مع QR
  const openWhatsAppWithQR = () => {
    if (!qrCode) return;

    // إنشاء رابط WhatsApp Web مع QR
    const whatsappWebUrl = `https://web.whatsapp.com/`;

    if (isIOS()) {
      // على iOS، فتح في نافذة جديدة
      window.open(whatsappWebUrl, '_blank');
    } else if (isAndroid()) {
      // على Android، محاولة فتح التطبيق أولاً
      const appUrl = `intent://web.whatsapp.com/#Intent;scheme=https;package=com.whatsapp;end`;
      window.location.href = appUrl;

      // إذا فشل، فتح في المتصفح
      setTimeout(() => {
        window.open(whatsappWebUrl, '_blank');
      }, 2000);
    } else {
      window.open(whatsappWebUrl, '_blank');
    }
  };

  // دالة لنسخ QR كنص
  const copyQRAsText = async () => {
    if (!qrCode) return;

    try {
      // استخراج النص من QR Code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // هنا يمكن إضافة مكتبة لقراءة QR Code
        // للآن سنستخدم رابط مباشر
        const qrText = qrCode; // يجب استخراج النص الفعلي
        await navigator.clipboard.writeText(qrText);
        setStatus('تم نسخ رمز QR! الصقه في تطبيق قارئ QR');
      };

      img.src = qrCode;
    } catch (error) {
      console.error('خطأ في نسخ QR:', error);
      setStatus('فشل في نسخ رمز QR');
    }
  };

  // دالة لمشاركة QR
  const shareQR = async () => {
    if (!qrCode) return;

    try {
      if (navigator.share) {
        // استخدام Web Share API
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], 'whatsapp-qr.png', { type: 'image/png' });

        await navigator.share({
          title: 'رمز QR للواتساب',
          text: 'امسح هذا الرمز لربط حسابك',
          files: [file]
        });
      } else {
        // fallback: تحميل الصورة
        const link = document.createElement('a');
        link.download = 'whatsapp-qr.png';
        link.href = qrCode;
        link.click();
      }
    } catch (error) {
      console.error('خطأ في مشاركة QR:', error);
      setStatus('فشل في مشاركة رمز QR');
    }
  };

  // لو ما في توكن -> رجّع المستخدم لصفحة الدخول
  useEffect(() => {
    if (!token) {
      setStatus("غير مصرح. سيتم تحويلك لتسجيل الدخول...");
      setTimeout(() => (window.location.href = "/login"), 500);
    }
  }, [token]);

  // ===== Socket.IO setup + Start Session via REST =====
  useEffect(() => {
    if (!token) return;

    // فعّل النقل الاحتياطي polling لتفادي مشاكل Proxy/CORS
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 4000,
    });
    socketRef.current = socket;

    socket.on("connect", async () => {
      setConnected(true);
      setStatus("متصل بالسيرفر، جاري طلب رمز QR...");

      // ابدأ/جدّد الجلسة عبر REST (السيرفر سيبث QR عبر Socket)
      try {
        await http.post("/wa/session/start", {}); // http يضيف Authorization تلقائيًا
      } catch {
        setStatus("تعذر بدء الجلسة. تحقق من التوكن/CORS/Node>=20");
        setLoading(false);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setStatus("انقطع الاتصال. بإمكانك المحاولة مرة أخرى.");
    });

    // استقبال QR (قد يكون DataURL جاهز أو raw)
    socket.on("wa:qr", async ({ qr, format }) => {
      try {
        setLoading(false);
        if (!qr) {
          setQrCode(null);
          setStatus("لم يصل رمز QR. حاول مرة أخرى.");
          return;
        }

        if (qr.startsWith("data:image") || format === "dataurl") {
          // جاهز للعرض
          setQrCode(qr);
        } else {
          // raw: حوّله محليًا إلى DataURL
          const dataUrl = await QRCode.toDataURL(qr);
          setQrCode(dataUrl);
        }
        setStatus("امسح الرمز من واتساب خلال 60 ثانية");
      } catch {
        setQrCode(null);
        setStatus("تعذر تحويل رمز QR. حاول إعادة التوليد.");
      }
    });

    // توحيد حالات الحالة (AWAITING_SCAN / READY / DISCONNECTED / ERROR ...)
    socket.on("wa:status", (msg) => {
      const map = {
        AWAITING_SCAN: "📱 الرجاء مسح الرمز باستخدام واتساب خلال 60 ثانية",
        AUTHENTICATED: "✅ تم التحقق من الجلسة.",
        READY: "✅ الجلسة جاهزة.",
        DISCONNECTED: "⚠️ تم فصل الجلسة. يمكنك توليد رمز جديد.",
        RECONNECT_FAILED: "❌ فشل إعادة الاتصال تلقائيًا.",
        ERROR: "❌ حدث خطأ في الاتصال.",
      };
      setStatus(map[msg] || msg || "تحديث حالة");

      if (msg === "READY" || msg === "AUTHENTICATED") {
        // عند الجاهزية لا حاجة لعرض QR
        setQrCode(null);
      }
    });

    socket.on("wa:error", (errMsg) => {
      setLoading(false);
      setStatus(`حدث خطأ: ${errMsg || "غير معروف"}`);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("wa:qr");
      socket.off("wa:status");
      socket.off("wa:error");
      socket.disconnect();
    };
  }, [token]);

  // ===== زر إعادة توليد الرمز =====
  const handleRegenerate = async () => {
    setQrCode(null);
    setStatus("جاري توليد رمز جديد...");
    setLoading(true);

    try {
      await http.post("/wa/session/start", {}); // http يضيف Authorization تلقائيًا
      // الـQR سيصل عبر Socket بحدث wa:qr
    } catch {
      setStatus("تعذر إعادة توليد الرمز.");
      setLoading(false);
    }
  };

  return (
    <>
      <MobileAlert />
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl mb-6 shadow-2xl animate-glow">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">ربط الواتساب</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اربط حساب الواتساب الخاص بك مع البوت لبدء استخدام الخدمات
          </p>
        </div>

        {/* اختيار طريقة الاتصال */}
        {connectionMethod === 'auto' && (
          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">اختر طريقة الربط</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setConnectionMethod('qr')}
                className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-4xl mb-4">🖥️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">من الكمبيوتر</h3>
                <p className="text-gray-600">امسح رمز QR باستخدام تطبيق الواتساب</p>
              </button>

              <button
                onClick={() => setConnectionMethod('link')}
                className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">من الجوال</h3>
                <p className="text-gray-600">ربط مباشر عبر تطبيق الواتساب</p>
              </button>
            </div>
          </div>
        )}

        {/* حالة الاتصال */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-full font-semibold ${
            connected
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
            }`}></div>
            {status}
          </div>
        </div>

        {/* عرض QR Code أو خيارات الموبايل */}
        {connectionMethod === 'qr' && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">امسح رمز QR</h2>

            <div className="flex justify-center items-center mb-6 min-h-[20rem]">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="loading-spinner mb-4"></div>
                  <p className="text-gray-600">جاري توليد رمز QR...</p>
                </div>
              ) : qrCode ? (
                <div className="relative">
                  <img src={qrCode} alt="QR Code" className="w-80 h-80 rounded-2xl shadow-2xl border-4 border-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📱</span>
                  </div>
                  <p className="text-gray-600 text-lg">
                    {connected
                      ? "لا يوجد رمز QR حاليًا"
                      : "غير متصل بالخادم"}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleRegenerate} className="btn-primary">
                🔄 توليد رمز جديد
              </button>
              <button onClick={() => setConnectionMethod('link')} className="btn-secondary">
                📱 استخدم الجوال بدلاً
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2">كيفية المسح:</h3>
              <ol className="text-sm text-gray-600 text-right space-y-1">
                <li>1. افتح تطبيق الواتساب على جوالك</li>
                <li>2. اذهب إلى الإعدادات ← الأجهزة المرتبطة</li>
                <li>3. اضغط على "ربط جهاز"</li>
                <li>4. امسح الرمز أعلاه</li>
              </ol>
            </div>
          </div>
        )}

        {/* خيارات الموبايل */}
        {connectionMethod === 'link' && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ربط من الجوال</h2>

            {isMobile() ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">أنت تستخدم جوال!</h3>
                  <p className="text-gray-600 mb-4">يمكنك ربط الواتساب مباشرة من هنا</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={openWhatsAppWithQR}
                    className="btn-primary text-lg py-4"
                  >
                    🚀 فتح الواتساب ويب
                  </button>

                  {qrCode && (
                    <>
                      <button
                        onClick={shareQR}
                        className="btn-secondary"
                      >
                        📤 مشاركة رمز QR
                      </button>

                      <button
                        onClick={copyQRAsText}
                        className="btn-outline"
                      >
                        📋 نسخ رمز QR
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="btn-ghost"
                  >
                    {showInstructions ? '🔼' : '🔽'} تعليمات مفصلة
                  </button>
                </div>

                {showInstructions && (
                  <div className="mt-6 p-6 bg-yellow-50 rounded-2xl text-right">
                    <h3 className="font-bold text-gray-800 mb-4">طرق بديلة للربط:</h3>

                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="bg-white p-4 rounded-xl">
                        <h4 className="font-semibold mb-2">🔗 الطريقة الأولى - الرابط المباشر:</h4>
                        <ol className="space-y-1">
                          <li>1. اضغط على "فتح الواتساب ويب" أعلاه</li>
                          <li>2. سيفتح الواتساب ويب في متصفح جديد</li>
                          <li>3. ارجع لهذه الصفحة وستجد رمز QR</li>
                          <li>4. امسح الرمز من الواتساب ويب</li>
                        </ol>
                      </div>

                      <div className="bg-white p-4 rounded-xl">
                        <h4 className="font-semibold mb-2">📱 الطريقة الثانية - جهاز آخر:</h4>
                        <ol className="space-y-1">
                          <li>1. اضغط على "مشاركة رمز QR"</li>
                          <li>2. أرسل الصورة لجهاز آخر (كمبيوتر/تابلت)</li>
                          <li>3. افتح الصورة على الجهاز الآخر</li>
                          <li>4. امسح الرمز من جوالك</li>
                        </ol>
                      </div>

                      <div className="bg-white p-4 rounded-xl">
                        <h4 className="font-semibold mb-2">💻 الطريقة الثالثة - الكمبيوتر:</h4>
                        <ol className="space-y-1">
                          <li>1. افتح هذا الرابط على الكمبيوتر</li>
                          <li>2. اختر "من الكمبيوتر"</li>
                          <li>3. امسح رمز QR من جوالك</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🖥️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">أنت تستخدم كمبيوتر</h3>
                <p className="text-gray-600 mb-6">يُفضل استخدام رمز QR للربط</p>
                <button
                  onClick={() => setConnectionMethod('qr')}
                  className="btn-primary"
                >
                  🔄 التبديل لرمز QR
                </button>
              </div>
            )}
          </div>
        )}

        {/* زر العودة للاختيار */}
        {connectionMethod !== 'auto' && (
          <div className="text-center mt-8">
            <button
              onClick={() => setConnectionMethod('auto')}
              className="btn-ghost"
            >
              ← العودة لاختيار طريقة الربط
            </button>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <span className="mr-2">🔒</span>
            اتصال آمن ومشفر
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
