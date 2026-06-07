/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ResortDetails from './pages/ResortDetails';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resort/:id" element={<ResortDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Issyk-Kul Resorts</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Ваш надежный гид по лучшим местам для отдыха на побережье жемчужины Кыргызстана.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Навигация</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/" className="hover:text-sky-700 transition-colors">Главная</a></li>
                    <li><a href="/about" className="hover:text-sky-700 transition-colors">О нас</a></li>
                    <li><a href="/contacts" className="hover:text-sky-700 transition-colors">Контакты</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Контакты</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>info@issyk-kul-resorts.kg</li>
                    <li>+996 (555) 123-456</li>
                    <li>г. Бишкек, пр. Чуй 123</li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Issyk-Kul Resorts Directory. Дипломный проект.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
