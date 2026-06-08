import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, CheckCircle, XCircle, Clock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface Booking {
  id: number;
  resort_name: string;
  image_url: string;
  location: string;
  check_in: string;
  check_out: string;
  guests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export default function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ссылка на ваш бэкенд (Render)
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        // ИСПРАВЛЕНО: Добавлен API_URL
        const res = await fetch(`${API_URL}/api/bookings/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки бронирований');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить историю бронирований.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full md:w-auto px-6 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-100"
          >
            Выйти из аккаунта
          </button>
        </div>

        {/* Bookings Section */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Мои бронирования</h2>
          <p className="text-gray-500 mt-1">История ваших поездок и текущие заявки</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-red-100 text-center">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-2">Упс! Произошла ошибка</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">У вас пока нет бронирований</h3>
            <p className="text-gray-500 mb-6">Самое время запланировать отдых на Иссык-Куле!</p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-sky-700 text-white font-medium rounded-xl hover:bg-sky-800 transition-colors shadow-sm"
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking, idx) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6"
              >
                <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={booking.image_url} 
                    alt={booking.resort_name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <h3 className="font-serif text-xl font-bold text-gray-900">{booking.resort_name}</h3>
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 shrink-0",
                      booking.status === 'confirmed' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      booking.status === 'pending' && "bg-amber-50 text-amber-700 border-amber-200",
                      booking.status === 'cancelled' && "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                      {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                      {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {booking.status === 'confirmed' ? 'Подтверждено' : booking.status === 'pending' ? 'Ожидает' : 'Отменено'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-sky-700" />
                    {booking.location}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl mt-auto grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Заезд - Выезд</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Гости</p>
                      <p className="text-sm font-medium text-gray-900">{booking.guests}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
