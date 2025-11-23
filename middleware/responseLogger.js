const { ErrorLog } = require('../models');

/**
 * Middleware untuk logging error response ke database
 * Hanya menyimpan jika status code >= 400 (error)
 */
const responseLogger = (req, res, next) => {
  // Simpan original res.json dan res.status
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);
  
  // Track status code
  let statusCode = res.statusCode || 200;
  
  // Override res.status untuk track status code
  res.status = function(code) {
    statusCode = code;
    return originalStatus(code);
  };
  
  // Override res.json untuk intercept response
  res.json = function(data) {
    // Cek apakah status code menunjukkan error (4xx atau 5xx)
    const isError = statusCode >= 400;

    if (isError) {
      // Extract error information
      const errorMessage = data.message || data.error || `HTTP ${statusCode} Error`;
      const errorStack = data.stack || (data.error && typeof data.error === 'string' ? data.error : null);

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
    }

    // Call original res.json
    return originalJson(data);
  };

  next();
};

module.exports = responseLogger;

