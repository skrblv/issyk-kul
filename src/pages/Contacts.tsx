import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contacts() {
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f5f2] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl text-gray-900 mb-4">Свяжитесь с нами</h1>
          <div className="w-24 h-1 bg-sky-700 mx-auto rounded-full opacity-50 mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы всегда рады помочь вам с выбором идеального места для отдыха на побережье Иссык-Куля.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6">
              <div className="bg-sky-50 p-4 rounded-2xl text-sky-700">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-2">Наш офис</h3>
                <p className="text-gray-600 leading-relaxed">
                  Кыргызская Республика,<br />
                  г. Бишкек, пр. Чуй 123,<br />
                  Бизнес-центр "Азия", офис 405
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6">
              <div className="bg-sky-50 p-4 rounded-2xl text-sky-700">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-2">Телефоны</h3>
                <p className="text-gray-600 leading-relaxed">
                  +996 (555) 123-456<br />
                  +996 (700) 987-654
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6">
              <div className="bg-sky-50 p-4 rounded-2xl text-sky-700">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 leading-relaxed">
                  info@issyk-kul-resorts.kg<br />
                  support@issyk-kul-resorts.kg
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="font-serif text-3xl text-gray-900 mb-6">Написать нам</h3>
            {isSent ? (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 text-center">
                <h4 className="font-bold mb-2">Сообщение отправлено!</h4>
                <p className="text-sm">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50" placeholder="Азамат" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50" placeholder="azamat@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение</label>
                  <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 outline-none bg-gray-50 resize-none" placeholder="Чем мы можем вам помочь?"></textarea>
                </div>
                <button type="submit" className="w-full bg-sky-700 text-white font-medium py-4 rounded-xl hover:bg-sky-800 transition-colors shadow-md">
                  Отправить сообщение
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
