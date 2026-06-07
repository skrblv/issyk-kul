import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Check, ArrowLeft, Star, Calendar, Users, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Resort {
  id: number;
  name: string;
  description: string;
  location: string;
  price: string;
  image_url: string;
  amenities: string;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ResortDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [resort, setResort] = useState<Resort | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 взрослых');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    Promise.all([
      fetch(`/api/resorts/${id}`).then(res => res.json()),
      fetch(`/api/resorts/${id}/reviews`).then(res => res.json())
    ])
    .then(([resortData, reviewsData]) => {
      if (resortData.error) throw new Error();
      setResort(resortData);
      setReviews(reviewsData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingStatus('loading');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resort_id: id, check_in: checkIn, check_out: checkOut, guests })
      });
      if (res.ok) {
        setBookingStatus('success');
        setCheckIn(''); setCheckOut('');
      } else {
        setBookingStatus('error');
      }
    } catch (err) {
      setBookingStatus('error');
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setReviewStatus('loading');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resort_id: id, rating, comment })
      });
      
      if (!res.ok) throw new Error('Ошибка отправки отзыва');

      // Refresh reviews
      const newReviews = await fetch(`/api/resorts/${id}/reviews`).then(res => res.json());
      setReviews(newReviews);
      setComment('');
      setRating(5);
      setReviewStatus('success');
      setTimeout(() => setReviewStatus('idle'), 3000);
    } catch (err) {
      setReviewStatus('error');
      setTimeout(() => setReviewStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  if (!resort) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-4xl text-gray-900 mb-4">Пансионат не найден</h1>
        <Link to="/" className="text-sky-700 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Вернуться на главную
        </Link>
      </div>
    );
  }

  const amenitiesList = resort.amenities.split(',').map(a => a.trim());
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'Новый';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#f8f5f2] min-h-screen pb-20"
    >
      {/* Hero Image */}
      <div className="relative h-[60vh] w-full">
        <img 
          src={resort.image_url} 
          alt={resort.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" /> Назад к списку
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 text-white/90 mb-3 text-sm font-medium">
                  <span className="flex items-center gap-1.5 bg-sky-700 px-3 py-1 rounded-full text-white">
                    <Star className="w-4 h-4 fill-white" />
                    {avgRating}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {resort.location}
                  </span>
                </div>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white drop-shadow-md">
                  {resort.name}
                </h1>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white">
                <p className="text-sm text-white/80 mb-1 uppercase tracking-wider font-semibold">Стоимость от</p>
                <p className="text-3xl font-bold">{resort.price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="font-serif text-3xl text-gray-900 mb-6">Об отдыхе</h2>
              <p className="text-gray-600 leading-relaxed text-lg bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                {resort.description}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-3xl text-gray-900 mb-6">Удобства и услуги</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-sky-200 transition-colors">
                    <div className="bg-sky-50 text-sky-700 p-2.5 rounded-xl">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <h2 className="font-serif text-3xl text-gray-900 mb-6 flex items-center gap-3">
                Отзывы гостей
                <span className="text-lg text-gray-400 font-sans font-normal">({reviews.length})</span>
              </h2>
              
              {user && (
                <form onSubmit={handleReview} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h4 className="font-medium text-gray-900 mb-4">Оставить отзыв</h4>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    required
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Поделитесь своими впечатлениями..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 resize-none mb-4"
                    rows={3}
                  />
                  <button 
                    type="submit" 
                    disabled={reviewStatus === 'loading'}
                    className="bg-sky-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-sky-800 transition-colors disabled:opacity-50"
                  >
                    {reviewStatus === 'loading' ? 'Отправка...' : reviewStatus === 'success' ? 'Отправлено!' : 'Опубликовать'}
                  </button>
                  {reviewStatus === 'error' && (
                    <p className="text-red-500 text-sm mt-3">Произошла ошибка при отправке отзыва. Попробуйте снова.</p>
                  )}
                </form>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 bg-white p-8 rounded-3xl border border-gray-100 text-center">Отзывов пока нет. Будьте первым!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{review.user_name}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar / Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
              <h3 className="font-serif text-2xl text-gray-900 mb-2">Забронировать</h3>
              <p className="text-gray-500 text-sm mb-8">Оставьте заявку, и мы свяжемся с вами для подтверждения.</p>
              
              {bookingStatus === 'success' ? (
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <h4 className="font-bold mb-1">Заявка отправлена!</h4>
                  <p className="text-sm">Мы свяжемся с вами в ближайшее время.</p>
                  <button 
                    onClick={() => setBookingStatus('idle')}
                    className="mt-4 text-emerald-700 font-medium hover:underline text-sm"
                  >
                    Забронировать еще
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleBooking}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Заезд</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="date" 
                          value={checkIn}
                          onChange={e => setCheckIn(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 text-sm" 
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Выезд</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="date" 
                          value={checkOut}
                          onChange={e => setCheckOut(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 text-sm" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Гости</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={guests}
                        onChange={e => setGuests(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 appearance-none"
                      >
                        <option>1 взрослый</option>
                        <option>2 взрослых</option>
                        <option>2 взрослых + 1 ребенок</option>
                        <option>Семья (4+ человек)</option>
                      </select>
                    </div>
                  </div>
                  
                  {bookingStatus === 'error' && (
                    <p className="text-red-500 text-sm text-center">Произошла ошибка. Попробуйте снова.</p>
                  )}

                  <button 
                    type="submit" 
                    disabled={bookingStatus === 'loading'}
                    className="w-full bg-sky-700 text-white font-medium py-4 rounded-xl hover:bg-sky-800 transition-colors mt-2 shadow-md disabled:opacity-70"
                  >
                    {bookingStatus === 'loading' ? 'Отправка...' : 'Оставить заявку'}
                  </button>
                  
                  {!user && (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      Для бронирования необходимо <Link to="/login" className="text-sky-700 hover:underline">войти в аккаунт</Link>
                    </p>
                  )}
                </form>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Гарантия лучшей цены</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
