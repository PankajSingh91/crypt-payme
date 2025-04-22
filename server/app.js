// server/app.js or index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const balanceRoutes = require('./routes/balanceRoutes');



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Route prefix
app.use('/api', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/balances', balanceRoutes);

mongoose.connect('mongodb://localhost:27017/cryptpayme', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => console.error('MongoDB connection error:', err));
