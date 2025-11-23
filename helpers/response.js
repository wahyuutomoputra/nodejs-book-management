/**
 * Helper untuk menyeragamkan response API
 */

/**
 * Response sukses dengan data
 * @param {Object} res - Express response object
 * @param {*} data - Data yang akan dikembalikan
 * @param {string} message - Pesan sukses (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = null, statusCode = 200) => {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Response sukses dengan pesan saja (tanpa data)
 * @param {Object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successMessage = (res, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: message
  });
};

/**
 * Response error
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error detail (optional, hanya di development)
 */
const error = (res, message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message: message
  };

  // Hanya tampilkan error detail di development
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error instanceof Error ? error.message : error;
    if (error instanceof Error && error.stack) {
      response.stack = error.stack;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Response validation error
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Pesan error atau array pesan error
 * @param {number} statusCode - HTTP status code (default: 400)
 */
const validationError = (res, errors, statusCode = 400) => {
  const response = {
    success: false,
    message: 'Validation error',
    errors: Array.isArray(errors) ? errors : [errors]
  };

  return res.status(statusCode).json(response);
};

/**
 * Response unauthorized (401)
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Unauthorized')
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message: message
  });
};

/**
 * Response forbidden (403)
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Forbidden')
 */
const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message: message
  });
};

/**
 * Response not found (404)
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error (default: 'Not found')
 */
const notFound = (res, message = 'Not found') => {
  return res.status(404).json({
    success: false,
    message: message
  });
};

/**
 * Response bad request (400)
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error
 */
const badRequest = (res, message) => {
  return res.status(400).json({
    success: false,
    message: message
  });
};

/**
 * Response created (201)
 * @param {Object} res - Express response object
 * @param {*} data - Data yang dibuat
 * @param {string} message - Pesan sukses (optional)
 */
const created = (res, data = null, message = null) => {
  return success(res, data, message, 201);
};

/**
 * Response paginated data
 * @param {Object} res - Express response object
 * @param {Array} data - Array data
 * @param {Object} pagination - Object pagination {page, limit, total, totalPages}
 * @param {string} message - Pesan sukses (optional)
 */
const paginated = (res, data, pagination, message = null) => {
  const response = {
    success: true,
    data: data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0
    }
  };

  if (message) {
    response.message = message;
  }

  return res.status(200).json(response);
};

module.exports = {
  success,
  successMessage,
  error,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  created,
  paginated
};

