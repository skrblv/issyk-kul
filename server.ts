import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Разрешаем запросы с фронтенда (Vercel)
app.use(cors());
app.use(express.json());

// Инициализация БД (На Render, если подключишь Disk, измени путь на '/data/issyk-kul.db')
const db = new Database('issyk-kul.db');

// --- СОЗДАНИЕ ТАБЛИЦ ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );
  CREATE TABLE IF NOT EXISTS resorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    location TEXT,
    price TEXT,
    image_url TEXT,
    amenities TEXT
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    resort_id INTEGER,
    check_in TEXT,
    check_out TEXT,
    guests TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(resort_id) REFERENCES resorts(id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    resort_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(resort_id) REFERENCES resorts(id)
  );
`);

// --- МОК-ДАННЫЕ ---
// Добавляем админа, если его нет
const adminEmail = 'admin@gmail.com';
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Администратор', adminEmail, hash, 'admin');
}

// Добавляем курорты, если база пустая
const resortsCount = db.prepare('SELECT COUNT(*) as count FROM resorts').get() as { count: number };
if (resortsCount.count === 0) {
  const insert = db.prepare('INSERT INTO resorts (name, description, location, price, image_url, amenities) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run(
    'Карвен Четыре Сезона', 
    'Элитный центр отдыха на северном берегу с первоклассным сервисом, крытым бассейном, теннисными кортами и шикарным пирсом.', 
    'с. Сары-Ой', 
    'от 12 000 сом/сутки', 
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000', 
    'Бассейн, SPA, Ресторан, Пляж, Wi-Fi, Теннис'
  );
  insert.run(
    'Санаторий Аврора', 
    'Легендарный санаторий в форме белого корабля. Отличное медицинское лечение, огромная зеленая парковая зона и чистый пляж.', 
    'с. Булан-Соготту', 
    'от 4 500 сом/сутки', 
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1000', 
    'Лечение, Питание, Парк, Пляж, Экскурсии'
  );
  insert.run(
    'ЦО Радуга', 
    'Популярный семейный пансионат с развитой инфраструктурой, анимацией для детей, уютными коттеджами и термальными источниками.', 
    'с. Сары-Ой', 
    'от 8 000 сом/сутки', 
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000', 
    'Детская площадка, Бассейн, Коттеджи, Пляж'
  );
  insert.run(
    'Каприз', 
    'Современный курортный комплекс для активного отдыха круглый год. Отличные пирсы, спортивные площадки и комфортные номера.', 
    'с. Бактуу-Долоноту', 
    'от 9 500 сом/сутки', 
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000', 
    'Спортзал, Бассейн, Ресторан, Пирс'
  );
}

const JWT_SECRET = process.env.JWT_SECRET || 'issyk-kul-secret-2026';

// --- МИДЛВАРЫ ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Не авторизован' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
  next();
};

// --- РОУТЫ: АВТОРИЗАЦИЯ ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
    const token = jwt.sign({ id: result.lastInsertRowid, role: 'user' }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email уже используется' });
    } else {
      res.status(500).json({ error: 'Ошибка при регистрации' });
    }
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authenticate, (req: any, res: any) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// --- РОУТЫ: КУРОРТЫ ---
app.get('/api/resorts', (req, res) => {
  const { search, minPrice, maxPrice, amenities, sort } = req.query;
  
  let query = 'SELECT r.*, COALESCE(AVG(rev.rating), 0) as avg_rating FROM resorts r LEFT JOIN reviews rev ON r.id = rev.resort_id';
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(r.name LIKE ? OR r.location LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY r.id';

  if (sort === 'rating') {
    query += ' ORDER BY avg_rating DESC, r.id DESC';
  } else {
    query += ' ORDER BY r.id DESC';
  }

  let resorts = db.prepare(query).all(...params) as any[];

  if (minPrice || maxPrice || amenities) {
    resorts = resorts.filter(r => {
      let keep = true;
      const priceMatch = r.price.match(/\d[\d\s]*/);
      const priceVal = priceMatch ? parseInt(priceMatch[0].replace(/\s/g, ''), 10) : 0;

      if (minPrice && priceVal < parseInt(minPrice as string, 10)) keep = false;
      if (maxPrice && priceVal > parseInt(maxPrice as string, 10)) keep = false;

      if (amenities && keep) {
        const requiredAmenities = (amenities as string).split(',').map(a => a.trim().toLowerCase());
        const resortAmenities = r.amenities.toLowerCase();
        const hasAll = requiredAmenities.every(req => resortAmenities.includes(req));
        if (!hasAll) keep = false;
      }
      return keep;
    });
  }

  if (sort === 'price_asc') {
    resorts.sort((a, b) => {
      const pA = a.price.match(/\d[\d\s]*/) ? parseInt(a.price.match(/\d[\d\s]*/)[0].replace(/\s/g, ''), 10) : 0;
      const pB = b.price.match(/\d[\d\s]*/) ? parseInt(b.price.match(/\d[\d\s]*/)[0].replace(/\s/g, ''), 10) : 0;
      return pA - pB;
    });
  } else if (sort === 'price_desc') {
    resorts.sort((a, b) => {
      const pA = a.price.match(/\d[\d\s]*/) ? parseInt(a.price.match(/\d[\d\s]*/)[0].replace(/\s/g, ''), 10) : 0;
      const pB = b.price.match(/\d[\d\s]*/) ? parseInt(b.price.match(/\d[\d\s]*/)[0].replace(/\s/g, ''), 10) : 0;
      return pB - pA;
    });
  }

  res.json(resorts);
});

app.get('/api/resorts/:id', (req, res) => {
  const resort = db.prepare('SELECT * FROM resorts WHERE id = ?').get(req.params.id);
  if (!resort) return res.status(404).json({ error: 'Пансионат не найден' });
  res.json(resort);
});

app.post('/api/resorts', authenticate, isAdmin, (req, res) => {
  const { name, description, location, price, image_url, amenities } = req.body;
  const result = db.prepare('INSERT INTO resorts (name, description, location, price, image_url, amenities) VALUES (?, ?, ?, ?, ?, ?)').run(name, description, location, price, image_url, amenities);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/resorts/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('DELETE FROM resorts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- РОУТЫ: БРОНИРОВАНИЯ ---
app.post('/api/bookings', authenticate, (req: any, res: any) => {
  const { resort_id, check_in, check_out, guests } = req.body;
  const result = db.prepare('INSERT INTO bookings (user_id, resort_id, check_in, check_out, guests) VALUES (?, ?, ?, ?, ?)').run(req.user.id, resort_id, check_in, check_out, guests);
  res.json({ id: result.lastInsertRowid, success: true });
});

app.get('/api/bookings/me', authenticate, (req: any, res: any) => {
  const bookings = db.prepare(`
    SELECT b.*, r.name as resort_name, r.image_url, r.location 
    FROM bookings b 
    JOIN resorts r ON b.resort_id = r.id 
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

app.get('/api/bookings', authenticate, isAdmin, (req: any, res: any) => {
  const bookings = db.prepare(`
    SELECT b.*, r.name as resort_name, u.name as user_name, u.email as user_email
    FROM bookings b 
    JOIN resorts r ON b.resort_id = r.id 
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bookings);
});

app.put('/api/bookings/:id/status', authenticate, isAdmin, (req: any, res: any) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// --- РОУТЫ: ОТЗЫВЫ ---
app.get('/api/resorts/:id/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.resort_id = ? 
    ORDER BY r.created_at DESC
  `).all(req.params.id);
  res.json(reviews);
});

app.post('/api/reviews', authenticate, (req: any, res: any) => {
  const { resort_id, rating, comment } = req.body;
  const result = db.prepare('INSERT INTO reviews (user_id, resort_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.user.id, resort_id, rating, comment);
  res.json({ id: result.lastInsertRowid, success: true });
});

// --- ЗАПУСК СЕРВЕРА ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
