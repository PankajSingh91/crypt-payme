// server/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const balanceRoutes = require('./routes/balanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND origin - adjust if your frontend runs on a different host/port or in production
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true, // <--- allow session cookie from browser
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'Accept', 'Origin']
};

// IMPORTANT: use CORS before routes so preflight requests are handled
app.use(cors(corsOptions));
// respond to preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Route prefix
app.use('/auth', authRoutes);
app.use('/wallets', walletRoutes);
app.use('/api', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/balances', balanceRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cryptpayme', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => console.error('MongoDB connection error:', err));
