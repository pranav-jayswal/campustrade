const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load variables from .env into process.env
dotenv.config();

// Connect to MongoDB before the server starts accepting traffic
connectDB();

const app = express();

const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ---------- Core middleware & Security ----------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or matching allowed list
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // parse form-encoded bodies

// Serve uploaded product photos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limit API endpoints to prevent abuse / DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/bounties', require('./routes/bountyRoutes'));
app.use('/api/lost-found', require('./routes/lostFoundRoutes'));

// ---------- Error handling (must be registered last) ----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
