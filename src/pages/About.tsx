import { motion } from 'motion/react';

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f5f2]"
    >
      {/* Hero */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=2000" 
          alt="Горы Иссык-Куля" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-4 font-bold drop-shadow-lg">
            О проекте
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl mx-auto">
            Ваш надежный гид по отдыху на жемчужине Кыргызстана
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-6 sm:p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100 -mt-32 relative z-20">
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <h2 className="font-serif text-3xl text-gray-900 mb-6">Жемчужина Центральной Азии</h2>
            <p className="mb-6 leading-relaxed">
              Иссык-Куль — это не просто озеро, это уникальная экосистема, место силы и главная курортная зона Кыргызстана. Наш проект создан для того, чтобы каждый мог легко и быстро найти идеальное место для отдыха, будь то роскошный пятизвездочный отель, уютный семейный пансионат или уединенная база отдыха в горах.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" 
                alt="Курорт" 
                className="rounded-2xl shadow-md w-full h-64 object-cover"
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800" 
                alt="Природа" 
                className="rounded-2xl shadow-md w-full h-64 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
}
