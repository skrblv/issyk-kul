import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  LayoutDashboard,
  Users,
  Trash2,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";

interface Resort {
  id: number;
  name: string;
  location: string;
  price: string;
}

interface Booking {
  id: number;
  resort_name: string;
  user_name: string;
  user_email: string;
  check_in: string;
  check_out: string;
  guests: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"resorts" | "bookings">(
    "bookings",
  );

  // Ссылка на ваш бэкенд (Render)
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [resorts, setResorts] = useState<Resort[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [resortToDelete, setResortToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchResorts = async (query = searchQuery) => {
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const url = query 
        ? `${API_URL}/api/resorts?search=${encodeURIComponent(query)}` 
        : `${API_URL}/api/resorts`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ошибка загрузки пансионатов");
      const data = await res.json();
      setResorts(data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Не удалось загрузить пансионаты');
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    } else if (user) {
      fetchBookings();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === "admin") {
      const delayDebounceFn = setTimeout(() => {
        fetchResorts(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, user]);

  const fetchBookings = async () => {
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const res = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки бронирований");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Не удалось загрузить бронирования');
    }
  };

  const handleAddResort = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const res = await fetch(`${API_URL}/api/resorts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          location,
          price,
          image_url: imageUrl,
          amenities,
        }),
      });
      
      if (!res.ok) throw new Error("Ошибка при добавлении");
      
      setName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setImageUrl("");
      setAmenities("");
      fetchResorts();
      showMessage('success', "Пансионат успешно добавлен!");
    } catch (err) {
      console.error(err);
      showMessage('error', "Не удалось добавить пансионат");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteResort = async () => {
    if (resortToDelete === null) return;
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const res = await fetch(`${API_URL}/api/resorts/${resortToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка при удалении");
      fetchResorts();
      showMessage('success', 'Пансионат удален');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Не удалось удалить пансионат');
    } finally {
      setResortToDelete(null);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Ошибка при обновлении статуса");
      fetchBookings();
      showMessage('success', 'Статус бронирования обновлен');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Не удалось обновить статус');
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Toast Message */}
      {message && (
        <div className={clsx(
          "fixed top-24 right-8 px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform",
          message.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {message.text}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {resortToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Удалить пансионат?</h3>
            <p className="text-gray-500 text-sm mb-6">Это действие нельзя отменить. Все данные о пансионате будут удалены.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setResortToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={confirmDeleteResort}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
            Панель администратора
          </h1>
          <p className="text-gray-500">
            Управление платформой Issyk-Kul Resorts
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("bookings")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "bookings"
                ? "bg-sky-700 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <Calendar className="w-4 h-4" />
            Бронирования
          </button>
          <button
            onClick={() => setActiveTab("resorts")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "resorts"
                ? "bg-sky-700 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <Building className="w-4 h-4" />
            Пансионаты
          </button>
        </div>
      </div>

      {activeTab === "bookings" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              Все бронирования
            </h2>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Поиск по клиенту или пансионату..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all w-full sm:w-72 text-sm bg-white"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Клиент
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Пансионат
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Даты
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.filter(b => 
                  b.user_name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) || 
                  b.user_email.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                  b.resort_name.toLowerCase().includes(bookingSearchQuery.toLowerCase())
                ).map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {booking.user_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.user_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {booking.resort_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(booking.check_in).toLocaleDateString()} —{" "}
                      {new Date(booking.check_out).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-400">
                        {booking.guests}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          booking.status === "confirmed" &&
                            "bg-emerald-50 text-emerald-700 border-emerald-200",
                          booking.status === "pending" &&
                            "bg-amber-50 text-amber-700 border-amber-200",
                          booking.status === "cancelled" &&
                            "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {booking.status === "confirmed"
                          ? "Подтверждено"
                          : booking.status === "pending"
                            ? "Ожидает"
                            : "Отменено"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(booking.id, "confirmed")
                              }
                              className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-emerald-200 whitespace-nowrap"
                            >
                              Подтвердить
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(booking.id, "cancelled")
                              }
                              className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200 whitespace-nowrap"
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Нет активных бронирований
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "resorts" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-700" />
                Добавить место
              </h2>
              <form onSubmit={handleAddResort} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Название
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Локация
                  </label>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50"
                    placeholder="с. Бостери"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Цена
                  </label>
                  <input
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50"
                    placeholder="от 5000 сом"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    URL Изображения
                  </label>
                  <input
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Удобства (через запятую)
                  </label>
                  <input
                    required
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50"
                    placeholder="Бассейн, Wi-Fi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Описание
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-700 text-white font-medium py-3 rounded-xl hover:bg-sky-800 transition-colors mt-4 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Каталог пансионатов
                </h2>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Поиск пансионатов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all w-full sm:w-64 text-sm bg-white"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Название
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Локация
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Цена
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resorts.map((resort) => (
                      <tr
                        key={resort.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {resort.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                          {resort.location}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                          {resort.price}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setResortToDelete(resort.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {resorts.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          База данных пуста
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
