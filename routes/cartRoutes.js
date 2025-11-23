const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart items user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, authorize('customer'), getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add book to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Buku berhasil ditambahkan ke keranjang
 *       400:
 *         description: Bad request (stock tidak mencukupi atau validasi error)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, authorize('customer'), addToCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove book from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Buku berhasil dihapus dari keranjang
 *       404:
 *         description: Item tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, authorize('customer'), removeFromCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Quantity berhasil diupdate
 *       400:
 *         description: Bad request
 *       404:
 *         description: Item tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, authorize('customer'), updateCartQuantity);

module.exports = router;

