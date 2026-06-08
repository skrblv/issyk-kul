import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Calendar, Users, Filter, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Resort {
  id: number;
  name: string;
  description: string;
  location: string;
  price: string;
  image_url: string;
  amenities: string;
}

const AMENITIES_LIST = [
  'Бассейн', 'SPA', 'Ресторан', 'Пляж', 'Wi-Fi', 'Теннис', 'Лечение', 'Питание', 'Парк', 'Экскурсии', 'Детская площадка', 'Коттеджи', 'Спортзал', 'Пирс'
];

export default function Home() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ссылка на ваш бэкенд (Render)
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('default');

  const fetchResorts = async (query = searchQuery, minP = minPrice, maxP = maxPrice, amenities = selectedAmenities, sort = sortBy) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (minP) params.append('minPrice', minP);
      if (maxP) params.append('maxPrice', maxP);
      if (amenities.length > 0) params.append('amenities', amenities.join(','));
      if (sort !== 'default') params.append('sort', sort);

      // ИСПРАВЛЕНО: Добавлен API_URL для запроса на Render
      const url = `${API_URL}/api/resorts${params.toString() ? '?' + params.toString() : ''}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Ошибка при загрузке данных');
      const data = await res.json();
      setResorts(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить список пансионатов. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResorts();
    // Scroll to results
    document.getElementById('resorts-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    fetchResorts();
    setShowFilters(false);
    document.getElementById('resorts-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setSortBy('default');
    setSearchQuery('');
    fetchResorts('', '', '', [], 'default');
    setShowFilters(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f5f2]"
    >
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://www.issykkul.biz/portals/0/issykkul-3.jpg" 
            alt="Озеро Иссык-Куль" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#f8f5f2]" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-[-10vh]">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 font-bold tracking-tight drop-shadow-lg"
          >
            Жемчужина <span className="italic font-normal">Азии</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-white/90 mb-12 font-light max-w-3xl mx-auto drop-shadow-md"
          >
            Бронируйте лучшие пансионаты, санатории и базы отдыха на побережье кристально чистого озера Иссык-Куль.
          </motion.p>
          
          {/* Functional Search Bar */}
          <motion.form 
            onSubmit={handleSearch}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-3 rounded-3xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 border border-white/20"
          >
            <div className="flex-1 flex items-center gap-3 px-6 py-3 md:py-2 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-100">
              <MapPin className="w-5 h-5 text-sky-700 shrink-0" />
              <div className="text-left w-full">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Куда едем?</p>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Название или локация (напр. Бостери)" 
                  className="w-full outline-none text-gray-900 font-medium bg-transparent placeholder-gray-400" 
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3 md:py-2 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-100 opacity-60 cursor-not-allowed">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="text-left w-full">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Даты</p>
                <input type="text" disabled placeholder="Любые даты" className="w-full outline-none text-gray-400 font-medium bg-transparent cursor-not-allowed" />
              </div>
            </div>
            <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-2 pt-2 md:pt-0">
              <button 
                type="button" 
                onClick={() => setShowFilters(true)}
                className="px-6 py-3 md:py-4 text-gray-600 hover:text-sky-700 transition-colors flex items-center gap-2 font-medium"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Фильтры</span>
              </button>
              <button type="submit" className="bg-sky-700 text-white px-8 py-3 md:py-4 rounded-2xl md:rounded-full hover:bg-sky-800 transition-colors w-full md:w-auto flex justify-center items-center font-medium shadow-md flex-1 md:flex-none">
                <Search className="w-5 h-5 mr-2" />
                Найти
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-6 h-6 text-sky-700" />
                  Фильтры
                </h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Цена за сутки (сом)</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        placeholder="От" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        placeholder="До" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Сортировка</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSortBy('default')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'default' ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      По умолчанию
                    </button>
                    <button
                      onClick={() => setSortBy('price_asc')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'price_asc' ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Сначала дешевые
                    </button>
                    <button
                      onClick={() => setSortBy('price_desc')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'price_desc' ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Сначала дорогие
                    </button>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'rating' ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      По рейтингу
                    </button>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Удобства</h3>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map(amenity => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-sky-100 text-sky-800 border-2 border-sky-500'
                            : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0 z-10">
                <button 
                  onClick={resetFilters}
                  className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Сбросить
                </button>
                <button 
                  onClick={applyFilters}
                  className="flex-1 bg-sky-700 text-white px-6 py-3 rounded-xl hover:bg-sky-800 transition-colors font-medium shadow-md"
                >
                  Показать результаты
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resorts Grid */}
      <section id="resorts-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-4xl text-gray-900 mb-4">
              {(searchQuery || minPrice || maxPrice || selectedAmenities.length > 0) ? 'Результаты поиска' : 'Популярные места'}
            </h2>
            <p className="text-gray-500">
              {(searchQuery || minPrice || maxPrice || selectedAmenities.length > 0) ? `Найдено вариантов: ${resorts.length}` : 'Лучшие предложения для вашего отдыха'}
            </p>
          </div>
          {(searchQuery || minPrice || maxPrice || selectedAmenities.length > 0 || sortBy !== 'default') && (
            <button 
              onClick={resetFilters}
              className="text-sky-700 font-medium hover:text-sky-800 transition-colors"
            >
              Сбросить поиск
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
            <h3 className="text-xl font-medium text-red-600 mb-2">Упс! Произошла ошибка</h3>
            <p className="text-gray-500">{error}</p>
            <button 
              onClick={() => fetchResorts(searchQuery)}
              className="mt-6 bg-sky-700 text-white px-6 py-2 rounded-xl hover:bg-sky-800 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : resorts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resorts.map((resort, index) => (
              <motion.div 
                key={resort.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/resort/${resort.id}`} className="block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={resort.image_url} 
                      alt={resort.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                      {resort.price}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sky-700 mb-3 text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      {resort.location}
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-sky-700 transition-colors">{resort.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {resort.description}
                    </p>
                    <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                      {resort.amenities.split(',').slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {amenity.trim()}
                        </span>
                      ))}
                      {resort.amenities.split(',').length > 3 && (
                        <span className="text-xs font-medium text-gray-400 px-2 py-1.5">
                          +{resort.amenities.split(',').length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
