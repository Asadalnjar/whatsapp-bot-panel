import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'جاري التحميل...', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-green-500',
    danger: 'border-red-500'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinner متقدم */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin`}>
          <div className={`absolute inset-0 border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
        </div>
        
        {/* تأثير التوهج */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-lg animate-pulse`}></div>
      </div>
      
      {/* النص */}
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
      
      {/* نقاط متحركة */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
