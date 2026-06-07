import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contacts' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-sky-700 p-2 rounded-xl group-hover:bg-sky-800 transition-colors">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Issyk-Kul <span className="text-sky-700 italic font-normal">Resorts</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={clsx(
                    "text-sm font-medium transition-colors hover:text-sky-700",
                    location.pathname === link.path ? "text-sky-700" : "text-gray-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 px-4 py-2 rounded-full transition-colors border border-amber-100">
                      <Shield className="w-4 h-4" />
                      Админ-панель
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">
                    <UserIcon className="w-4 h-4 text-sky-700" />
                    <Link to="/profile" className="hover:text-sky-700">{user.name}</Link>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-all border border-gray-100 hover:border-red-100"
                    title="Выйти"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-sky-700 transition-colors px-2">
                    Войти
                  </Link>
                  <Link to="/register" className="text-sm font-medium bg-sky-700 text-white px-6 py-2.5 rounded-full hover:bg-sky-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "block px-3 py-3 rounded-xl text-base font-medium",
                    location.pathname === link.path
                      ? "bg-sky-50 text-sky-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-sky-700"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 flex items-center gap-3">
                      <div className="bg-sky-100 p-2 rounded-full">
                        <UserIcon className="w-5 h-5 text-sky-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-sky-700"
                    >
                      Мой профиль
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-base font-medium text-amber-700 hover:bg-amber-50"
                      >
                        Админ-панель
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 px-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Войти
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-sky-700 hover:bg-sky-800"
                    >
                      Регистрация
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
