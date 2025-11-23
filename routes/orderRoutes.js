const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrderDetail } = require('../controllers/orderController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Checkout - Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: "Jl. Contoh No. 123, Jakarta"
 *     responses:
 *       201:
 *         description: Checkout berhasil
 *       400:
 *         description: Bad request (keranjang kosong atau stock tidak mencukupi)
 *       401:
 *         description: Unauthorized
 */
router.post('/checkout', authenticateToken, authorize('customer'), checkout);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List orders berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, authorize('customer'), getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order detail
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Detail order berhasil diambil
 *       404:
 *         description: Order tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, authorize('customer'), getOrderDetail);

module.exports = router;

