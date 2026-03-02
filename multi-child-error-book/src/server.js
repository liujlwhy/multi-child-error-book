const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import routes
const childrenRoutes = require('./routes/children');
const errorQuestionsRoutes = require('./routes/errorQuestions');
const recommendationRoutes = require('./routes/recommendation');
const pdfRoutes = require('./routes/pdf');
const reviewRoutes = require('./routes/review');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads and public directories exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('public/pdfs')) {
  fs.mkdirSync('public/pdfs', { recursive: true });
}

// Serve static files
app.use('/pdfs', express.static('public/pdfs'));

// Routes
app.use('/api/children', childrenRoutes);
app.use('/api/error-questions', errorQuestionsRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/review', reviewRoutes);
app.use('/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer().catch(console.error);