const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'COMPASS Backend API',
    version: '1.0.0',
    college: 'Single College Scope (Apex Institute of Technology)',
    matchingType: 'Deterministic Set Intersection (0% AI)'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 COMPASS Express Server running on http://localhost:${PORT}`);
  console.log(`📌 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Matching Engine: Deterministic Set-Intersection`);
  console.log(`====================================================`);
});
