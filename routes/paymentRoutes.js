const express = require('express');
const router = express.Router();
const { paymentCallback, getPaymentStatus } = require('../controllers/paymentController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/payments/callback:
 *   post:
 *     summary: Payment callback - Update payment status (untuk payment gateway)
 *     tags: [Payments]
 *     description: Endpoint ini dipanggil oleh payment gateway untuk update status pembayaran
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed]
 *                 example: success
 *               paymentReference:
 *                 type: string
 *                 example: "PAY-123456789"
 *               callbackData:
 *                 type: string
 *                 example: "Additional callback data"
 *     responses:
 *       200:
 *         description: Payment status berhasil diupdate
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order atau Payment tidak ditemukan
 */
router.post('/callback', paymentCallback);

/**
 * @swagger
 * /api/payments/status/{orderId}:
 *   get:
 *     summary: Get payment status by order ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status berhasil diambil
 *       404:
 *         description: Order atau Payment tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:orderId', authenticateToken, authorize('customer'), getPaymentStatus);

module.exports = router;

