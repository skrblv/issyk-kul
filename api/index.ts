import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Подключение к базе данных Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'issyk-kul-secret-2026';

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

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    // RETURNING id возвращает ID созданной записи
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hash]
    );
    const userId = result.rows[0].id;
    const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET);
    res.json({ token, user: { id: userId, name, email, role: 'user' } });
  } catch (err: any) {
    if (err.code === '23505') { // Код ошибки уникальности в PostgreSQL
      res.status(400).json({ error: 'Email уже используется' });
    } else {
      res.status(500).json({ error: 'Ошибка при регистрации' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/resorts', async (req, res) => {
  const { search, minPrice, maxPrice, amenities, sort } = req.query;
  
  try {
    let query = `
      SELECT r.*, COALESCE(AVG(rev.rating), 0) as avg_rating 
      FROM resorts r 
      LEFT JOIN reviews rev ON r.id = rev.resort_id
    `;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      // ILIKE в PostgreSQL - это поиск без учета регистра
      conditions.push(`(r.name ILIKE $${paramIndex} OR r.location ILIKE $${paramIndex + 1})`);
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
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

    const result = await pool.query(query, params);
    let resorts = result.rows;

    // Твоя логика фильтрации на JS остается без изменений
    if (minPrice || maxPrice || amenities) {
      resorts = resorts.filter(r => {
        let keep = true;
        
        const priceMatch = r.price.match(/\d[\d\s]*/);
        const priceVal = priceMatch ? parseInt(priceMatch[0].replace(/\s/g, ''), 10) : 0;

        if (minPrice && priceVal < parseInt(minPrice as string, 10)) keep = false;
        if (maxPrice && priceVal > parseInt(maxPrice as string, 10)) keep = false;

        if (amenities && keep) {
          const requiredAmenities = (amenities as string).split(',').map(a => a.trim().toLowerCase());
          const resortAmenities = (r.amenities || '').toLowerCase();
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
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки курортов' });
  }
});

app.get('/api/resorts/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resorts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пансионат не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/resorts', authenticate, isAdmin, async (req, res) => {
  const { name, description, location, price, image_url, amenities } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO resorts (name, description, location, price, image_url, amenities) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, description, location, price, image_url, amenities]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка добавления' });
  }
});

app.delete('/api/resorts/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM resorts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Bookings
app.post('/api/bookings', authenticate, async (req: any, res: any) => {
  const { resort_id, check_in, check_out, guests } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, resort_id, check_in, check_out, guests) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, resort_id, check_in, check_out, guests]
    );
    res.json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка бронирования' });
  }
});

app.get('/api/bookings/me', authenticate, async (req: any, res: any) => {
  try {
    const result = await pool.query(`
      SELECT b.*, r.name as resort_name, r.image_url, r.location 
      FROM bookings b 
      JOIN resorts r ON b.resort_id = r.id 
      WHERE b.user_id = $1 
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки бронирований' });
  }
});

app.get('/api/bookings', authenticate, isAdmin, async (req: any, res: any) => {
  try {
    const result = await pool.query(`
      SELECT b.*, r.name as resort_name, u.name as user_name, u.email as user_email
      FROM bookings b 
      JOIN resorts r ON b.resort_id = r.id 
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

app.put('/api/bookings/:id/status', authenticate, isAdmin, async (req: any, res: any) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

app.get('/api/resorts/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.resort_id = $1 
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки отзывов' });
  }
});

app.post('/api/reviews', authenticate, async (req: any, res: any) => {
  const { resort_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, resort_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, resort_id, rating, comment]
    );
    res.json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка добавления отзыва' });
  }
});

// ЭКСПОРТ ДЛЯ VERCEL (Без app.listen)
export default app;
