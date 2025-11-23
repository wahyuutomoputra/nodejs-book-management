const { ErrorLog } = require('../models');

/**
 * Middleware untuk logging error ke database
 */
const errorLogger = async (err, req, res, next) => {
  try {
    // Extract error information
    const errorMessage = err.message || err.toString();
    const errorStack = err.stack || null;
    const statusCode = err.status || err.statusCode || 500;

    // Extract request information
    const userId = req.user ? req.user.id : null;
    const method = req.method || null;
    const url = req.originalUrl || req.url || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.get('user-agent') || null;

    // Extract request body (limit size untuk menghindari data terlalu besar)
    let requestBody = null;
    if (req.body && Object.keys(req.body).length > 0) {
      try {
        const bodyStr = JSON.stringify(req.body);
        // Limit to 5000 characters
        requestBody = bodyStr.length > 5000 ? bodyStr.substring(0, 5000) + '...' : bodyStr;
      } catch (e) {
        requestBody = '[Unable to stringify request body]';
      }
    }

    // Extract request headers (sensitive data akan di-filter)
    let requestHeaders = null;
    try {
      const headers = { ...req.headers };
      // Remove sensitive headers
      delete headers.authorization;
      delete headers.cookie;
      delete headers['x-api-key'];
      const headersStr = JSON.stringify(headers);
      // Limit to 2000 characters
      requestHeaders = headersStr.length > 2000 ? headersStr.substring(0, 2000) + '...' : headersStr;
    } catch (e) {
      requestHeaders = '[Unable to stringify headers]';
    }

    // Save error log to database (non-blocking)
    ErrorLog.create({
      userId,
      method,
      url,
      statusCode,
      errorMessage,
      errorStack,
      requestBody,
      requestHeaders,
      ipAddress,
      userAgent
    }).catch(logError => {
      // Log error saat logging error (jangan sampai crash aplikasi)
      console.error('❌ Error saat menyimpan error log ke database:', logError);
    });

    // Continue to next error handler
    next(err);
  } catch (loggerError) {
    // Jika ada error di logger sendiri, tetap lanjutkan ke error handler
    console.error('❌ Error di error logger middleware:', loggerError);
    next(err);
  }
};

module.exports = errorLogger;

