import React, { useState, useEffect } from "react";
import http from "../api/http";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      violationAlerts: true,
      dailyReports: false
    },
    general: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      autoBackup: true,
      sessionTimeout: 30
    },
    privacy: {
      showOnlineStatus: true,
      allowGroupInvites: true,
      sharePhoneNumber: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // جلب الإعدادات عند تحميل الصفحة
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await http.get("/user/profile");

      if (response.data) {
        // تحديث الإعدادات من البيانات المستلمة
        setSettings(prevSettings => ({
          ...prevSettings,
          // يمكن إضافة المزيد من الإعدادات هنا حسب ما يرجع من Backend
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      showMessage('خطأ في جلب الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // حفظ الإعدادات
  const handleSave = async () => {
    try {
      const response = await http.put("/user/profile", {
        settings: settings
      });

      if (response.data.success) {
        showMessage("تم حفظ الإعدادات بنجاح ✅", "success");
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      showMessage("خطأ في حفظ الإعدادات ❌", "error");
    }
  };

  // تحديث إعداد معين
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return <p className="text-center mt-6">⏳ جارٍ تحميل الإعدادات...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* عنوان الصفحة */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">الإعدادات العامة</h1>
        <p className="text-gray-600">إدارة إعدادات حسابك والتفضيلات الشخصية</p>
      </div>

      {/* عرض الرسائل */}
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* إعدادات الإشعارات */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
          </svg>
          إعدادات الإشعارات
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">إشعارات البريد الإلكتروني</span>
              <p className="text-sm text-gray-500">تلقي إشعارات عبر البريد الإلكتروني</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">الإشعارات الفورية</span>
              <p className="text-sm text-gray-500">إشعارات فورية في المتصفح</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">تنبيهات الانتهاكات</span>
              <p className="text-sm text-gray-500">إشعار فوري عند اكتشاف انتهاك</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.violationAlerts}
              onChange={(e) => updateSetting('notifications', 'violationAlerts', e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">التقارير اليومية</span>
              <p className="text-sm text-gray-500">تقرير يومي بالأنشطة والإحصائيات</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.dailyReports}
              onChange={(e) => updateSetting('notifications', 'dailyReports', e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
        </div>
      </section>

      {/* الإعدادات العامة */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          الإعدادات العامة
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">اللغة</span>
              <p className="text-sm text-gray-500">لغة واجهة المستخدم</p>
            </div>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">المنطقة الزمنية</span>
              <p className="text-sm text-gray-500">المنطقة الزمنية المحلية</p>
            </div>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">النسخ الاحتياطي التلقائي</span>
              <p className="text-sm text-gray-500">نسخ احتياطي يومي للإعدادات</p>
            </div>
            <input
              type="checkbox"
              checked={settings.general.autoBackup}
              onChange={(e) => updateSetting('general', 'autoBackup', e.target.checked)}
              className="w-5 h-5 accent-green-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">مهلة انتهاء الجلسة</span>
              <p className="text-sm text-gray-500">بالدقائق (0 = بدون انتهاء)</p>
            </div>
            <input
              type="number"
              min="0"
              max="1440"
              value={settings.general.sessionTimeout}
              onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* إعدادات الخصوصية */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          إعدادات الخصوصية
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">إظهار حالة الاتصال</span>
              <p className="text-sm text-gray-500">إظهار متى كنت متصلاً آخر مرة</p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.showOnlineStatus}
              onChange={(e) => updateSetting('privacy', 'showOnlineStatus', e.target.checked)}
              className="w-5 h-5 accent-purple-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">السماح بدعوات المجموعات</span>
              <p className="text-sm text-gray-500">السماح للآخرين بدعوتك للمجموعات</p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.allowGroupInvites}
              onChange={(e) => updateSetting('privacy', 'allowGroupInvites', e.target.checked)}
              className="w-5 h-5 accent-purple-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">مشاركة رقم الهاتف</span>
              <p className="text-sm text-gray-500">إظهار رقم هاتفك للآخرين</p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.sharePhoneNumber}
              onChange={(e) => updateSetting('privacy', 'sharePhoneNumber', e.target.checked)}
              className="w-5 h-5 accent-purple-600"
            />
          </div>
        </div>
      </section>

      {/* زر الحفظ */}
      <div className="text-center">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💾 حفظ جميع الإعدادات
        </button>
      </div>
    </div>
  );
};

export default Settings;
