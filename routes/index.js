const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const { success } = require('../helpers/response');

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Contoh protected route (bisa diakses semua user yang sudah login)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengakses protected route
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
 *                   example: Ini adalah protected route
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 */
router.get('/protected', require('../middleware/auth').authenticateToken, (req, res) => {
  return success(res, { user: req.user }, 'Ini adalah protected route');
});

/**
 * @swagger
 * /api/admin-only:
 *   get:
 *     summary: Contoh route khusus admin (hanya bisa diakses oleh user dengan role admin)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengakses admin route
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
 *                   example: Ini adalah route khusus admin
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Forbidden - Akses ditolak, role tidak sesuai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Akses ditolak. Role tidak sesuai
 */
router.get('/admin-only', 
  require('../middleware/auth').authenticateToken,
  require('../middleware/auth').authorize('admin'),
  (req, res) => {
    return success(res, { user: req.user }, 'Ini adalah route khusus admin');
  }
);

module.exports = router;

