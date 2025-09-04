import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '✅',
      border: 'border-green-200'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: '❌',
      border: 'border-red-200'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: '⚠️',
      border: 'border-yellow-200'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: 'ℹ️',
      border: 'border-blue-200'
    }
  };

  const currentStyle = typeStyles[type];

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={`${currentStyle.bg} text-white px-6 py-4 rounded-2xl shadow-2xl border ${currentStyle.border} backdrop-blur-sm max-w-md`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{currentStyle.icon}</span>
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsLeaving(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
              }, 300);
            }}
            className="mr-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        
        {/* شريط التقدم */}
        <div className="mt-2 w-full bg-white/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full transition-all ease-linear"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// مكون إدارة Toast
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
