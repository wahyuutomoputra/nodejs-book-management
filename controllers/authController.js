const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');
const { Op } = require('sequelize');
const { success, error, badRequest, unauthorized } = require('../helpers/response');

// Helper function untuk generate token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Helper function untuk calculate expiry date
const getTokenExpiry = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  const expiryDate = new Date();
  
  if (expiresIn.includes('h')) {
    const hours = parseInt(expiresIn);
    expiryDate.setHours(expiryDate.getHours() + hours);
  } else if (expiresIn.includes('m')) {
    const minutes = parseInt(expiresIn);
    expiryDate.setMinutes(expiryDate.getMinutes() + minutes);
  } else {
    expiryDate.setHours(expiryDate.getHours() + 1); // default 1 hour
  }
  
  return expiryDate;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return badRequest(res, 'Email dan password harus diisi');
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return unauthorized(res, 'Email atau password salah');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return unauthorized(res, 'Email atau password salah');
    }

    // Deactivate all previous sessions (single device logic)
    await Session.update(
      { isActive: false },
      {
        where: {
          userId: user.id,
          isActive: true
        }
      }
    );

    // Generate new token
    const token = generateToken(user.id);
    const expiresAt = getTokenExpiry();

    // Create new session
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const session = await Session.create({
      userId: user.id,
      token: token,
      deviceInfo: deviceInfo,
      expiresAt: expiresAt,
      isActive: true
    });

    return success(res, {
      token: token,
      expiresAt: expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, 'Login berhasil');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Error saat login', 500, err);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      await Session.update(
        { isActive: false },
        {
          where: {
            token: token,
            isActive: true
          }
        }
      );
    }

    return success(res, null, 'Logout berhasil');
  } catch (err) {
    console.error('Logout error:', err);
    return error(res, 'Error saat logout', 500, err);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
    });

    return success(res, user);
  } catch (err) {
    console.error('Get profile error:', err);
    return error(res, 'Error saat mengambil profil', 500, err);
  }
};

module.exports = {
  login,
  logout,
  getProfile
};

