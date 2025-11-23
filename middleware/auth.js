const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');
const { unauthorized, error: errorResponse } = require('../helpers/response');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return unauthorized(res, 'Access token tidak ditemukan');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is active
    const session = await Session.findOne({
      where: {
        token: token,
        isActive: true,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'name']
      }]
    });

    if (!session) {
      return unauthorized(res, 'Token tidak valid atau sudah expired');
    }

    // Attach user info to request
    req.user = session.user;
    req.session = session;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Token tidak valid');
    }
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token sudah expired');
    }
    return errorResponse(res, 'Error saat autentikasi', 500, err);
  }
};

// Middleware untuk check role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      const { forbidden } = require('../helpers/response');
      return forbidden(res, 'Akses ditolak. Role tidak sesuai');
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};

