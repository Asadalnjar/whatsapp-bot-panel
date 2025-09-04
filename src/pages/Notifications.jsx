import React, { useEffect, useState } from "react";
import { http } from "../api/http";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    http.get("/user/notifications")
    .then(res => setNotifications(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">الإشعارات</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-600">📭 لا توجد إشعارات حالياً.</p>
      ) : (
        <div className="section-card space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className="border-b pb-2">
              <p className="text-gray-800">{n.message}</p>
              <p className="text-gray-500 text-xs">📅 {n.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
