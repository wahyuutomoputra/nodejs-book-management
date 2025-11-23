const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const sequelize = require('./config/database');
const { runMigrations } = require('./config/migrations');
const { runSeeders } = require('./config/seeders');
const routes = require('./routes');
const errorLogger = require('./middleware/errorLogger');
const responseLogger = require('./middleware/responseLogger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { success, successMessage, notFound, error: errorResponse } = require('./helpers/response');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Apply to all requests
app.use(generalLimiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VLink API Documentation'
}));

// Response logger middleware - cek response sebelum dikirim ke user
app.use(responseLogger);

// Routes
app.use('/api', routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: []
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/health', (req, res) => {
  return successMessage(res, 'Server is running');
});

// Error logging middleware (untuk unhandled errors)
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  return errorResponse(res, err.message || 'Internal server error', err.status || 500, err);
});

// 404 handler
app.use((req, res) => {
  return notFound(res, 'Route tidak ditemukan');
});

// Database connection dan server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection berhasil.');

    // Jalankan migrasi
    console.log('🔄 Menjalankan migrasi database...');
    await runMigrations();

    // Jalankan seeders
    console.log('🌱 Menjalankan seeders...');
    await runSeeders();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error saat start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

