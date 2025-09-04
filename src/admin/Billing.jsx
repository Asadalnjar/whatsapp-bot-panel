// admin/Billing.jsx
import React, { useState, useEffect } from "react";
import { http } from "../api/http";
import { buildFileUrl } from "../config/api";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    userId: "",
    plan: "شهري",
    amount: "",
    method: "تحويل بنكي",
    status: "معلقة"
  });
  const [proofFile, setProofFile] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await http.get("/admin/billing");
      setInvoices(res.data.data || res.data);
    } catch {
      setError("❌ حدث خطأ أثناء جلب الفواتير");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await http.get("/admin/users");
      setUsers(res.data);
    } catch {
      console.error("خطأ في جلب المستخدمين");
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", newInvoice.userId);
      formData.append("plan", newInvoice.plan);
      formData.append("amount", newInvoice.amount);
      formData.append("method", newInvoice.method);
      formData.append("status", newInvoice.status);
      if (proofFile) {
        formData.append("proofFile", proofFile);
      }

      const res = await http.post("/admin/billing", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(res.data.message || "✅ تم إضافة الفاتورة بنجاح");
      setError("");
      setShowModal(false);
      setNewInvoice({
        userId: "",
        plan: "شهري",
        amount: "",
        method: "تحويل بنكي",
        status: "معلقة"
      });
      setProofFile(null);
      fetchInvoices();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("❌ حدث خطأ أثناء إضافة الفاتورة");
      }
      setMessage("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">سجل الاشتراكات والفواتير</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          ➕ إضافة فاتورة
        </button>
      </div>

      {message && (
        <div className="mb-4 text-green-600 text-sm text-center">{message}</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-600">⏳ جاري التحميل...</p>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">📭 لا توجد فواتير حالياً</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full section-card text-sm">
            <thead className="table-header">
              <tr>
                <th className="py-3 px-4">الاسم</th>
                <th className="py-3 px-4">رقم الجوال</th>
                <th className="py-3 px-4">الخطة</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">إثبات الدفع</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-t">
                  <td className="py-2 px-4">{inv.user?.name || "—"}</td>
                  <td className="py-2 px-4">{inv.user?.phone || "—"}</td>
                  <td className="py-2 px-4">{inv.plan}</td>
                  <td className="py-2 px-4">{inv.amount} ريال</td>
                  <td className="py-2 px-4">{inv.method}</td>
                  <td className="py-2 px-4">
                    {new Date(inv.date).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-2 px-4">{inv.status}</td>
                  <td className="py-2 px-4">
                    {inv.proofFile ? (
                      <a
                        href={buildFileUrl(inv.proofFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        عرض
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 مودال إضافة الفاتورة */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">إضافة فاتورة جديدة</h2>

            <label className="block mb-2">المستخدم</label>
            <select
              value={newInvoice.userId}
              onChange={(e) => setNewInvoice({ ...newInvoice, userId: e.target.value })}
              className="input mb-4 w-full"
            >
              <option value="">اختر المستخدم</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} - {u.phone}
                </option>
              ))}
            </select>

            <label className="block mb-2">الخطة</label>
            <select
              value={newInvoice.plan}
              onChange={(e) => setNewInvoice({ ...newInvoice, plan: e.target.value })}
              className="input mb-4 w-full"
            >
              <option value="شهري">شهري</option>
              <option value="سنوي">سنوي</option>
            </select>

            <label className="block mb-2">المبلغ</label>
            <input
              type="number"
              value={newInvoice.amount}
              onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              className="input mb-4 w-full"
            />

            <label className="block mb-2">طريقة الدفع</label>
            <select
              value={newInvoice.method}
              onChange={(e) => setNewInvoice({ ...newInvoice, method: e.target.value })}
              className="input mb-4 w-full"
            >
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
              <option value="PayPal">PayPal</option>
            </select>

            {newInvoice.method === "تحويل بنكي" && (
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p><strong>اسم البنك:</strong> بنك الرياض</p>
                <p><strong>رقم الحساب:</strong> 1234567890</p>
                <p><strong>رقم الآيبان:</strong> SA0000000000000000000000</p>
                <p><strong>اسم المستفيد:</strong> شركة واتساب بوت</p>
              </div>
            )}

            <label className="block mb-2">الحالة</label>
            <select
              value={newInvoice.status}
              onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
              className="input mb-4 w-full"
            >
              <option value="معلقة">معلقة</option>
              <option value="ناجحة">ناجحة</option>
              <option value="فشلت">فشلت</option>
            </select>

            {newInvoice.method === "تحويل بنكي" && (
              <>
                <label className="block mb-2">إثبات الدفع</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="input mb-4 w-full"
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                إلغاء
              </button>
              <button onClick={handleSaveInvoice} className="btn-primary">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
