# مرحلة البناء
FROM node:18-alpine as build

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci

# نسخ الكود المصدري
COPY . .

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج
FROM nginx:alpine

# نسخ ملفات البناء
COPY --from=build /app/dist /usr/share/nginx/html

# نسخ تكوين nginx
COPY nginx.conf /etc/nginx/nginx.conf

# فتح البورت
EXPOSE 80

# تشغيل nginx
CMD ["nginx", "-g", "daemon off;"]
