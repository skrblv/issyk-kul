import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Ссылка на ваш бэкенд (Render)
  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // ИСПРАВЛЕНО: Добавлен API_URL
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
      
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Создать аккаунт</h1>
          <p className="text-gray-500 text-sm">Присоединяйтесь к нашему сервису</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-700 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-sky-700 text-white font-medium py-3.5 rounded-xl hover:bg-sky-800 transition-colors shadow-md mt-2"
          >
            Зарегистрироваться
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Уже есть аккаунт? <Link to="/login" className="text-sky-700 font-semibold hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
```

**Последний важный совет:** 
Поскольку теперь фронтенд и бэкенд на разных доменах, в `server.ts` на Render обязательно должен быть настроен `cors()`. Убедись, что в твоем `server.ts` есть строка `app.use(cors());`. Если возникнет ошибка в консоли браузера `Access-Control-Allow-Origin`, это значит, что Render блокирует запрос от Vercel. 

Если это случится, поправь `cors` вот так:
```typescript
app.use(cors({
  origin: 'https://ВАШ-САЙТ-НА-VERCEL.vercel.app', // Укажи точный адрес фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
