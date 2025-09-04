// pages/admin/InvoiceReview.jsx
import React, { useState, useEffect } from 'react';
import http from '../../api/http';
import { buildFileUrl } from '../../config/api';

const InvoiceReview = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // جلب الاشتراكات قيد المراجعة
  const fetchPendingSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await http.get('/admin/subscriptions/pending');
      
      if (response.data.success) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error('خطأ في جلب الاشتراكات:', error);
      showMessage('خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  // دالة لعرض الرسائل
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // دالة لفتح نافذة التأكيد
  const openModal = (subscription, actionType) => {
    setSelectedSubscription(subscription);
    setAction(actionType);
    setShowModal(true);
    setReason('');
  };

  // دالة لإغلاق النافذة
  const closeModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
    setAction('');
    setReason('');
  };

  // دالة لتنفيذ الإجراء
  const handleAction = async () => {
    if (!selectedSubscription) return;

    try {
      const endpoint = action === 'approve' 
        ? `/admin/subscriptions/${selectedSubscription._id}/approve`
        : `/admin/subscriptions/${selectedSubscription._id}/reject`;

      const data = action === 'reject' ? { reason } : {};

      const response = await http.patch(endpoint, data);

      if (response.data.success) {
        showMessage(response.data.message, 'success');
        closeModal();
        await fetchPendingSubscriptions(); // إعادة تحميل البيانات
      }
    } catch (error) {
      console.error('خطأ في تنفيذ الإجراء:', error);
      showMessage(error.response?.data?.message || 'حدث خطأ', 'error');
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

  // دالة لترجمة حالة الفاتورة
  const translateInvoiceStatus = (status) => {
    const translations = {
      'uploaded': 'تم الرفع',
      'pending': 'قيد المراجعة',
      'accepted': 'مقبولة',
      'rejected': 'مرفوضة',
      'expired': 'منتهية الصلاحية'
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">مراجعة الاشتراكات والفواتير</h1>
        <p className="text-gray-600 mt-2">مراجعة وقبول أو رفض طلبات الاشتراك الجديدة</p>
      </div>

      {/* عرض الرسائل */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* قائمة الاشتراكات */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد اشتراكات قيد المراجعة</h3>
          <p className="mt-1 text-sm text-gray-500">جميع الاشتراكات تمت مراجعتها</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                {/* معلومات المستخدم */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subscription.userId?.name}
                    </h3>
                    <p className="text-sm text-gray-600">{subscription.userId?.email}</p>
                    <p className="text-sm text-gray-600">{subscription.userId?.phone}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {translateStatus(subscription.status)}
                  </span>
                </div>

                {/* معلومات الاشتراك */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">نوع الباقة:</span>
                    <p className="font-medium">{subscription.plan}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">المبلغ:</span>
                    <p className="font-medium">{subscription.amount} {subscription.currency}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">طريقة الدفع:</span>
                    <p className="font-medium">{subscription.paymentInfo?.method}</p>
                  </div>
                </div>

                {/* الفواتير */}
                {subscription.invoices && subscription.invoices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">الفواتير المرفقة:</h4>
                    <div className="space-y-2">
                      {subscription.invoices.map((invoice) => (
                        <div key={invoice._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">#{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-600">
                              {invoice.amount} {invoice.currency} - {invoice.method}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              invoice.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {translateInvoiceStatus(invoice.status)}
                            </span>
                            {invoice.fileUrl && (
                              <a
                                href={buildFileUrl(invoice.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                عرض الملف
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal(subscription, 'approve')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    قبول الاشتراك
                  </button>
                  <button
                    onClick={() => openModal(subscription, 'reject')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    رفض الاشتراك
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة التأكيد */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {action === 'approve' ? 'تأكيد قبول الاشتراك' : 'تأكيد رفض الاشتراك'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {action === 'approve' 
                ? `هل أنت متأكد من قبول اشتراك ${selectedSubscription?.userId?.name}؟`
                : `هل أنت متأكد من رفض اشتراك ${selectedSubscription?.userId?.name}؟`
              }
            </p>

            {action === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الرفض (اختياري)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="اكتب سبب رفض الاشتراك..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {action === 'approve' ? 'قبول' : 'رفض'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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

export default InvoiceReview;
