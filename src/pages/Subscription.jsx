// pages/Subscription.jsx
import React, { useState, useEffect } from "react";
import http from "../api/http";

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [formData, setFormData] = useState({
    plan: "شهري",
    amount: "",
    paymentMethod: "تحويل بنكي"
  });
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    method: "تحويل بنكي",
    reference: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // 📌 جلب بيانات الاشتراك
  const fetchSubscription = async () => {
    try {
      const res = await http.get("/user/subscription");
      if (res.data.success) {
        setSubscription(res.data.subscription);
        setInvoices(res.data.invoices || []);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الاشتراك:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // 📌 إنشاء اشتراك جديد
  const handleCreateSubscription = async () => {
    try {
      if (!formData.plan || !formData.amount || !formData.paymentMethod) {
        showMessage("يرجى تعبئة جميع الحقول", "error");
        return;
      }

      const res = await http.post("/user/subscription", formData);

      if (res.data.success) {
        showMessage(res.data.message, "success");
        setShowForm(false);
        await fetchSubscription();

        // إذا كان الاشتراك يتطلب رفع فاتورة
        if (res.data.subscription.status === 'pending_payment') {
          setShowInvoiceForm(true);
          setInvoiceData({
            ...invoiceData,
            amount: res.data.subscription.amount
          });
        }
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "حدث خطأ", "error");
    }
  };

  // 📌 رفع فاتورة الدفع
  const handleUploadInvoice = async () => {
    try {
      if (!subscription?.id) {
        showMessage("لا يوجد اشتراك لرفع الفاتورة له", "error");
        return;
      }

      if (!proofFile) {
        showMessage("يرجى اختيار ملف إثبات الدفع", "error");
        return;
      }

      const sendData = new FormData();
      sendData.append("invoice", proofFile);
      sendData.append("amount", invoiceData.amount);
      sendData.append("method", invoiceData.method);
      sendData.append("reference", invoiceData.reference);

      const res = await http.post(
        `/user/subscription/${subscription.id}/invoice`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        showMessage(res.data.message, "success");
        setShowInvoiceForm(false);
        setProofFile(null);
        await fetchSubscription();
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "حدث خطأ في رفع الفاتورة", "error");
    }
  };

  // دالة لعرض الرسائل
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // دالة للحصول على لون حالة الاشتراك
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-600';
      case 'pending_payment': return 'text-yellow-600';
      case 'under_review': return 'text-blue-600';
      case 'expired': return 'text-red-600';
      case 'suspended': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  // دالة لترجمة حالة الاشتراك
  const translateStatus = (status) => {
    const translations = {
      'new': 'جديد',
      'pending_payment': 'بانتظار الدفع',
      'under_review': 'قيد المراجعة',
      'approved': 'موافق عليه',
      'active': 'نشط',
      'suspended': 'موقوف',
      'expired': 'منتهي الصلاحية'
    };
    return translations[status] || status;
  };

  if (loading) return <p className="text-center">⏳ جاري تحميل بيانات الاشتراك...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center">إدارة الاشتراك</h1>

      {/* عرض الرسائل */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* معلومات الدفع البنكي */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          معلومات التحويل البنكي
        </h2>
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">رقم الحساب البنكي</p>
            <div className="bg-blue-100 rounded-lg p-3 mb-3">
              <p className="text-2xl font-bold text-blue-800 tracking-wider">3021351047</p>
            </div>
            <p className="text-sm text-gray-600 mb-2">يرجى التحويل على هذا الرقم ثم رفع صورة الإشعار</p>
            <div className="flex items-center justify-center text-sm text-orange-600 bg-orange-50 rounded-lg p-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              قبل بد الاشتراك تواصل مع الادارة وتس على هذا الرقم776689245 لكي تمنحك اذن بالاشتراك
            </div>
          </div>
        </div>
      </div>

      {/* إذا لا يوجد اشتراك */}
      {!subscription ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد اشتراك</h3>
          <p className="text-gray-600 mb-4">يرجى إنشاء اشتراك جديد للبدء في استخدام الخدمة</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إنشاء اشتراك جديد
          </button>
        </div>
      ) : (
        // إذا يوجد اشتراك
        <div>
          {/* رسالة للمستخدمين الجدد */}
          {subscription.status === 'new' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">مرحباً بك! يرجى إكمال عملية الاشتراك</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    1️⃣ اضغط "إكمال بيانات الاشتراك" أدناه<br/>
                    2️⃣ حول المبلغ على رقم الحساب: <strong>3021351047</strong><br/>
                    3️⃣ ارفع صورة إشعار التحويل<br/>
                    4️⃣ انتظر موافقة المشرف لتفعيل حسابك
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* معلومات الاشتراك */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">معلومات الاشتراك</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">الحالة:</span>
                <span className={`font-medium ${getStatusColor(subscription.status)}`}>
                  {translateStatus(subscription.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">نوع الباقة:</span>
                <span className="font-medium">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المبلغ:</span>
                <span className="font-medium">{subscription.amount} {subscription.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-medium">{subscription.paymentInfo?.method}</span>
              </div>
              {subscription.startedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ البدء:</span>
                  <span className="font-medium">
                    {new Date(subscription.startedAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              )}
              {subscription.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الانتهاء:</span>
                  <span className="font-medium">
                    {new Date(subscription.expiresAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="mt-6 space-y-2">
              {subscription.status === 'new' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إكمال بيانات الاشتراك
                </button>
              )}

              {subscription.status === 'pending_payment' && (
                <button
                  onClick={() => setShowInvoiceForm(true)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  رفع إثبات الدفع
                </button>
              )}

              {subscription.status === 'expired' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تجديد الاشتراك
                </button>
              )}
            </div>
          </div>

          {/* الفواتير */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">الفواتير الأخيرة</h2>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد فواتير</p>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">#{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{invoice.amount} {invoice.currency}</p>
                        <p className="text-sm text-gray-600">{invoice.method}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status === 'accepted' ? 'مقبولة' :
                         invoice.status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* نموذج إنشاء اشتراك جديد */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">إنشاء اشتراك جديد</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الباقة</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="شهري">شهري</option>
                  <option value="فصلي">فصلي (3 أشهر)</option>
                  <option value="سنوي">سنوي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ريال)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="STC Pay">STC Pay</option>
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSubscription}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء الاشتراك
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج رفع الفاتورة */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">رفع إثبات الدفع</h2>

            {/* تذكير برقم الحساب */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 text-center">
                <strong>تذكير:</strong> رقم الحساب البنكي: <span className="font-bold">3021351047</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع</label>
                <input
                  type="number"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل المبلغ المدفوع"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select
                  value={invoiceData.method}
                  onChange={(e) => setInvoiceData({...invoiceData, method: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="STC Pay">STC Pay</option>
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم المرجع (اختياري)</label>
                <input
                  type="text"
                  value={invoiceData.reference}
                  onChange={(e) => setInvoiceData({...invoiceData, reference: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم العملية أو المرجع"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة إشعار التحويل البنكي
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📸 ارفع صورة واضحة لإشعار التحويل البنكي (JPG, PNG, PDF - حد أقصى 5MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUploadInvoice}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                رفع الفاتورة
              </button>
              <button
                onClick={() => {
                  setShowInvoiceForm(false);
                  setProofFile(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
