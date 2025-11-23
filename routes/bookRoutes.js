const express = require('express');
const router = express.Router();
const { getBooks, getBookDetail } = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get list buku yang ready stock
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or author
 *     responses:
 *       200:
 *         description: List buku berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get detail buku by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Detail buku berhasil diambil
 *       404:
 *         description: Buku tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, getBookDetail);

module.exports = router;

