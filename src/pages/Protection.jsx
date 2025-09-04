// pages/Protection_Simple.jsx
import React, { useState, useEffect, useRef } from 'react';

import http from '../api/http';

const Protection = () => {
  const [settings, setSettings] = useState({
    protectionEnabled: false,
    protectionSettings: {
      autoKick: false,
      autoDelete: true,
      allowOwnerBypass: true
    }
  });
  
  const [bannedWords, setBannedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const newWordInputRef = useRef(null);
  
  const [newWord, setNewWord] = useState({
    word: '',
    type: 'contains',
    severity: 'medium',
    action: 'kick',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchSettings(),
        fetchBannedWords()
      ]);
      setInitialLoading(false);
    };

    loadData();
  }, []);
   useEffect(() => {
   if (showAddForm && newWordInputRef.current) {
    newWordInputRef.current.focus();
   }
 }
, [showAddForm]);
  const fetchSettings = async () => {
    try {
      const res = await http.get('/wa/session/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      // إذا لم توجد جلسة، استخدم الإعدادات الافتراضية
      if (error.response?.status === 404) {
        setSettings({
          protectionEnabled: false,
          protectionSettings: {
            autoKick: false,
            autoDelete: true,
            allowOwnerBypass: true
          }
        });
        setError('⚠️ لم يتم العثور على جلسة واتساب. يرجى إنشاء جلسة أولاً من صفحة QR.');
      }
    }
  };

  const fetchBannedWords = async () => {
    try {
      const res = await http.get('/user/banned-words');
      setBannedWords(res.data.words || []);
    } catch (error) {
      console.error('خطأ في جلب الكلمات المحظورة:', error);
      // إذا كان خطأ 400، فهذا يعني أن المستخدم لا يملك كلمات محظورة
      if (error.response?.status === 400) {
        setBannedWords([]);
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await http.put('/wa/session/settings', settings);
      if (res.data.success) {
        setMessage('✅ تم حفظ الإعدادات بنجاح');
        setError('');
      }
    } catch (error) {
      setError('❌ خطأ في حفظ الإعدادات');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const addBannedWord = async () => {
    if (!newWord.word.trim()) {
      setError('يرجى إدخال الكلمة المحظورة');
      return;
    }

    setLoading(true);
    try {
      const res = await http.post('/user/banned-words', newWord);
      if (res.data.success) {
     // أعد الجلب من السيرفر لضمان المزامنة
     await fetchBannedWords();
     // أبقي النموذج مفتوحاً وأعد ضبط الحقول
     setNewWord({ word: '', type: 'contains', severity: 'medium', action: 'kick', notes: '' });
     setMessage('✅ تم إضافة الكلمة بنجاح');
     setError('');
     // فوكس مباشر على الحقل لسرعة إدخال كلمة تالية
     if (newWordInputRef.current) newWordInputRef.current.focus();
      }
    } catch (error) {
      setError('❌ خطأ في إضافة الكلمة');
    } finally {
      setLoading(false);
    }
  };

  const toggleWord = async (wordId) => {
    if (!wordId) return;

    setLoading(true);
    try {
      const res = await http.put(`/user/banned-words/${wordId}/toggle`);
      if (res.data.success) {
        setBannedWords(bannedWords.map(word =>
          word._id === wordId ? { ...word, isActive: !word.isActive } : word
        ));
        setMessage('✅ تم تحديث حالة الكلمة');
        setError('');
      }
    } catch (error) {
      console.error('خطأ في تحديث الكلمة:', error);
      setError('❌ خطأ في تحديث الكلمة');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const deleteWord = async (wordId) => {
    if (!wordId || !confirm('هل أنت متأكد من حذف هذه الكلمة؟')) return;

    setLoading(true);
    try {
      const res = await http.delete(`/user/banned-words/${wordId}`);
      if (res.data.success) {
        setBannedWords(bannedWords.filter(word => word._id !== wordId));
        setMessage('✅ تم حذف الكلمة بنجاح');
        setError('');
      }
    } catch (error) {
      console.error('خطأ في حذف الكلمة:', error);
      setError('❌ خطأ في حذف الكلمة');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">⏳ جاري تحميل إعدادات الحماية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* عنوان الصفحة الاحترافي */}
        <div className="relative text-center mb-12">
          {/* تأثير الخلفية */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl mb-6 shadow-2xl relative animate-glow">
              <span className="text-4xl">🛡️</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>

            <h1 className="title-glow text-5xl md:text-6xl font-bold mb-4" data-text="الحماية والفلترة">
              الحماية والفلترة
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نظام حماية متقدم وذكي لحماية مجموعاتك من المحتوى غير المرغوب فيه مع تحكم كامل في الإعدادات
            </p>

            {/* مؤشرات الحالة */}
            <div className="flex justify-center items-center mt-6 space-x-6 space-x-reverse">
              <div className="flex items-center text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-semibold">الحماية نشطة</span>
              </div>
              <div className="flex items-center text-blue-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-semibold">المراقبة مستمرة</span>
              </div>
            </div>
          </div>
        </div>

        {/* رسائل النجاح والخطأ المحدثة */}
        {message && (
          <div className="alert-success fade-in">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">✅</span>
              {message}
            </div>
          </div>
        )}
        {error && (
          <div className="alert-error fade-in">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">⚠️</span>
              <div>
                {error}
                {error.includes('جلسة واتساب') && (
                  <div className="mt-3">
                    <a
                      href="/qr-session"
                      className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-300 font-medium"
                    >
                      <span className="ml-2">🔗</span>
                      انتقل إلى صفحة إنشاء الجلسة
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* إعدادات الحماية المحسنة */}
        <div className="glass-card animate-slide-up">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl animate-glow">
              <span className="text-3xl">⚙️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">إعدادات الحماية</h2>
              <p className="text-gray-600 text-lg">تخصيص قواعد الحماية المتقدمة لمجموعاتك</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* تفعيل الحماية العامة */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <div>
                    <label className="text-xl font-bold text-gray-800 block mb-1 cursor-pointer">
                      تفعيل الحماية العامة
                    </label>
                    <p className="text-gray-600">تشغيل نظام الحماية الشامل والمراقبة المستمرة</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.protectionEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      protectionEnabled: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 shadow-lg"></div>
                </label>
              </div>
            </div>

            {/* حذف الرسائل المخالفة */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🗑️</span>
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-800 block">
                      حذف الرسائل المخالفة
                    </label>
                    <p className="text-sm text-gray-600">حذف تلقائي للمحتوى المخالف</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.protectionSettings.autoDelete}
                    onChange={(e) => setSettings({
                      ...settings,
                      protectionSettings: {
                        ...settings.protectionSettings,
                        autoDelete: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* طرد المخالفين */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">👢</span>
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-800 block">
                      طرد المخالفين تلقائياً
                    </label>
                    <p className="text-sm text-gray-600">إزالة المستخدمين المخالفين</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.protectionSettings.autoKick}
                    onChange={(e) => setSettings({
                      ...settings,
                      protectionSettings: {
                        ...settings.protectionSettings,
                        autoKick: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>

            {/* استثناء المشرفين */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">👑</span>
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-800 block">
                      استثناء صاحب البوت والمشرفين
                    </label>
                    <p className="text-sm text-gray-600">عدم تطبيق قواعد الحماية على المشرفين</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.protectionSettings.allowOwnerBypass}
                    onChange={(e) => setSettings({
                      ...settings,
                      protectionSettings: {
                        ...settings.protectionSettings,
                        allowOwnerBypass: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* زر الحفظ المحدث */}
          <div className="mt-8 text-center">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="btn-primary px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-3"></div>
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-2xl mr-2">💾</span>
                  حفظ الإعدادات
                </div>
              )}
            </button>
          </div>
        </div>

        {/* الكلمات المحظورة المحدثة */}
        <div className="section-card fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">الكلمات المحظورة</h2>
                <p className="text-gray-600">إدارة قائمة الكلمات والعبارات المحظورة</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`btn-primary px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                showAddForm ? 'bg-gradient-to-r from-red-500 to-pink-500' : ''
              }`}
            >
              {showAddForm ? (
                <div className="flex items-center">
                  <span className="text-xl mr-2">❌</span>
                  إلغاء
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-xl mr-2">➕</span>
                  إضافة كلمة
                </div>
              )}
            </button>
          </div>

          {/* نموذج إضافة كلمة محدث */}
          {showAddForm && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl mb-8 border border-blue-100 shadow-lg fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                إضافة كلمة محظورة جديدة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label flex items-center">
                    <span className="text-lg mr-2">📝</span>
                    الكلمة المحظورة
                  </label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className="input w-full text-lg"
                    placeholder="أدخل الكلمة أو العبارة المحظورة"
                     ref={newWordInputRef}
onKeyDown={(e) => {
  if (e.key === 'Enter' && !loading) {
    e.preventDefault();
     addBannedWord();
  }
}}
                  />
                </div>

                <div className="form-group">
                  <label className="label flex items-center">
                    <span className="text-lg mr-2">🔍</span>
                    نوع المطابقة
                  </label>
                  <select
                    value={newWord.type}
                    onChange={(e) => setNewWord({ ...newWord, type: e.target.value })}
                    className="input w-full text-lg"
                  >
                    <option value="contains">يحتوي على</option>
                    <option value="exact">مطابق تماماً</option>
                    <option value="starts">يبدأ بـ</option>
                    <option value="ends">ينتهي بـ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label flex items-center">
                    <span className="text-lg mr-2">⚡</span>
                    مستوى الشدة
                  </label>
                  <select
                    value={newWord.severity}
                    onChange={(e) => setNewWord({ ...newWord, severity: e.target.value })}
                    className="input w-full text-lg"
                  >
                    <option value="low">🟢 منخفض</option>
                    <option value="medium">🟡 متوسط</option>
                    <option value="high">🔴 عالي</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label flex items-center">
                    <span className="text-lg mr-2">⚖️</span>
                    الإجراء المطلوب
                  </label>
                  <select
                    value={newWord.action}
                    onChange={(e) => setNewWord({ ...newWord, action: e.target.value })}
                    className="input w-full text-lg"
                  >
                    <option value="delete">🗑️ حذف الرسالة</option>
                    <option value="kick">👢 طرد المستخدم</option>
                    <option value="warn">⚠️ تحذير</option>
                    <option value="mute">🔇 كتم</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={addBannedWord}
                  disabled={loading}
                  className="btn-primary px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-3"></div>
                      جاري الإضافة...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">✅</span>
                      إضافة الكلمة
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* قائمة الكلمات المحظورة المحدثة */}
          {!bannedWords || bannedWords.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد كلمات محظورة</h3>
              <p className="text-gray-500">ابدأ بإضافة كلمات أو عبارات لحماية مجموعاتك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bannedWords.map((word, index) => (
                <div key={word._id || index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🚫</span>
                        <span className="font-bold text-lg text-gray-800">{word.word}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          🔍 {word.type === 'contains' ? 'يحتوي على' :
                               word.type === 'exact' ? 'مطابق تماماً' :
                               word.type === 'starts' ? 'يبدأ بـ' : 'ينتهي بـ'}
                        </span>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          word.severity === 'high' ? 'bg-red-100 text-red-800' :
                          word.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {word.severity === 'high' ? '🔴 عالي' :
                           word.severity === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
                        </span>

                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {word.action === 'delete' ? '🗑️ حذف' :
                           word.action === 'kick' ? '👢 طرد' :
                           word.action === 'warn' ? '⚠️ تحذير' : '🔇 كتم'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => word._id && toggleWord(word._id)}
                      disabled={loading || !word._id}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        word.isActive
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {word.isActive ? '✅ نشط' : '⏸️ معطل'}
                    </button>

                    <button
                      onClick={() => word._id && deleteWord(word._id)}
                      disabled={loading || !word._id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Protection;
