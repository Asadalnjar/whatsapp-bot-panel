import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MobileInstructions = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceType, setDeviceType] = useState('');

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const steps = [
    {
      id: 1,
      title: "تحديد نوع جهازك",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-600 text-center mb-8">
            أولاً، دعنا نحدد نوع جهازك لنقدم لك التعليمات المناسبة
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setDeviceType('ios');
                setCurrentStep(2);
              }}
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isIOS 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">iPhone / iPad</h3>
              <p className="text-gray-600">أجهزة Apple iOS</p>
              {isIOS && (
                <div className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-full inline-block">
                  تم اكتشافه تلقائياً
                </div>
              )}
            </button>
            
            <button
              onClick={() => {
                setDeviceType('android');
                setCurrentStep(2);
              }}
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isAndroid 
                  ? 'border-green-500 bg-green-50 shadow-lg' 
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Android</h3>
              <p className="text-gray-600">أجهزة أندرويد</p>
              {isAndroid && (
                <div className="mt-3 px-3 py-1 bg-green-500 text-white text-sm rounded-full inline-block">
                  تم اكتشافه تلقائياً
                </div>
              )}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "طرق الربط المتاحة",
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              اختر الطريقة المناسبة لك
            </h3>
            <p className="text-gray-600">
              لديك عدة خيارات لربط حساب الواتساب
            </p>
          </div>

          <div className="space-y-6">
            {/* الطريقة الأولى */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white text-xl">🌐</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">الطريقة الأولى: الواتساب ويب</h4>
                  <p className="text-gray-600 mb-4">فتح الواتساب ويب في متصفح منفصل</p>
                  <div className="bg-white p-4 rounded-xl">
                    <ol className="text-sm text-gray-700 space-y-2 text-right">
                      <li>1. اضغط على زر "فتح الواتساب ويب"</li>
                      <li>2. سيفتح متصفح جديد مع الواتساب ويب</li>
                      <li>3. ارجع لهذه الصفحة لرؤية رمز QR</li>
                      <li>4. امسح الرمز من الواتساب ويب</li>
                    </ol>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="mt-4 btn-primary btn-sm"
                  >
                    اختر هذه الطريقة
                  </button>
                </div>
              </div>
            </div>

            {/* الطريقة الثانية */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white text-xl">📤</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">الطريقة الثانية: مشاركة QR</h4>
                  <p className="text-gray-600 mb-4">إرسال رمز QR لجهاز آخر</p>
                  <div className="bg-white p-4 rounded-xl">
                    <ol className="text-sm text-gray-700 space-y-2 text-right">
                      <li>1. احصل على رمز QR من الصفحة</li>
                      <li>2. اضغط على "مشاركة رمز QR"</li>
                      <li>3. أرسل الصورة لكمبيوتر أو تابلت</li>
                      <li>4. امسح الرمز من جوالك</li>
                    </ol>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(4)}
                    className="mt-4 btn-secondary btn-sm"
                  >
                    اختر هذه الطريقة
                  </button>
                </div>
              </div>
            </div>

            {/* الطريقة الثالثة */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white text-xl">💻</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">الطريقة الثالثة: من الكمبيوتر</h4>
                  <p className="text-gray-600 mb-4">استخدام كمبيوتر أو لابتوب</p>
                  <div className="bg-white p-4 rounded-xl">
                    <ol className="text-sm text-gray-700 space-y-2 text-right">
                      <li>1. افتح هذا الرابط على الكمبيوتر</li>
                      <li>2. اذهب لصفحة ربط الواتساب</li>
                      <li>3. اختر "من الكمبيوتر"</li>
                      <li>4. امسح رمز QR من جوالك</li>
                    </ol>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(5)}
                    className="mt-4 btn-outline btn-sm"
                  >
                    اختر هذه الطريقة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // يمكن إضافة خطوات مفصلة لكل طريقة هنا
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* العنوان */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">دليل الربط</h1>
          <p className="text-xl text-gray-600">تعليمات مفصلة لربط الواتساب من الجوال</p>
        </div>

        {/* مؤشر التقدم */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* محتوى الخطوة الحالية */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {currentStepData?.title}
          </h2>
          {currentStepData?.content}
        </div>

        {/* أزرار التنقل */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← السابق
          </button>

          <Link to="/qr-session" className="btn-primary">
            🚀 ابدأ الربط الآن
          </Link>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي →
          </button>
        </div>

        {/* رابط سريع */}
        <div className="text-center mt-8">
          <Link to="/qr-session" className="text-blue-600 hover:text-blue-800 underline">
            تخطي التعليمات والذهاب مباشرة للربط
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileInstructions;
