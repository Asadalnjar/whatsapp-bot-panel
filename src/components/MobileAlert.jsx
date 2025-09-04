import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MobileAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // فحص إذا كان المستخدم على موبايل
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // فحص إذا تم إخفاء التنبيه مسبقاً
    const alertDismissed = localStorage.getItem('mobileAlertDismissed');
    
    if (isMobile && !alertDismissed && window.location.pathname === '/qr-session') {
      setShowAlert(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowAlert(false);
    localStorage.setItem('mobileAlertDismissed', 'true');
  };

  const handleDontShowAgain = () => {
    handleDismiss();
    localStorage.setItem('mobileAlertDismissed', 'permanent');
  };

  if (!showAlert || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">أنت تستخدم جوال!</h3>
              <p className="text-blue-100 mb-3">
                لا يمكنك مسح رمز QR من نفس الجهاز. لدينا حلول أفضل لك!
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Link 
                  to="/mobile-help"
                  className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium text-sm"
                >
                  <span className="mr-2">📚</span>
                  دليل الربط للجوال
                </Link>
                
                <button
                  onClick={() => {
                    // تغيير طريقة الاتصال إلى link
                    window.dispatchEvent(new CustomEvent('changeConnectionMethod', { detail: 'link' }));
                    handleDismiss();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-500/80 rounded-lg hover:bg-green-500 transition-all duration-300 font-medium text-sm"
                >
                  <span className="mr-2">🚀</span>
                  ربط مباشر
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors duration-200 text-xl"
              title="إغلاق"
            >
              ✕
            </button>
            <button
              onClick={handleDontShowAgain}
              className="text-white/60 hover:text-white/80 transition-colors duration-200 text-xs"
              title="عدم الإظهار مرة أخرى"
            >
              🚫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAlert;
