const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');

// Admin Book Controllers
const {
  getAllBooks,
  getBookDetail,
  createBook,
  updateBook,
  updateStock,
  deleteBook
} = require('../controllers/admin/bookController');

// Admin Transaction Controllers
const {
  getAllTransactions,
  getTransactionDetail
} = require('../controllers/admin/transactionController');

// Admin Report Controllers
const {
  getSalesReport,
  getBookSalesReport
} = require('../controllers/admin/reportController');

// Apply admin authorization to all routes
router.use(authenticateToken);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/books:
 *   get:
 *     summary: Get all books (admin) - tidak terbatas stock
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List buku berhasil diambil
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Hanya admin
 */
router.get('/books', getAllBooks);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   get:
 *     summary: Get book detail by ID (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail buku berhasil diambil
 *       404:
 *         description: Buku tidak ditemukan
 */
router.get('/books/:id', getBookDetail);

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     summary: Create new book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               coverImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Buku berhasil ditambahkan
 *       400:
 *         description: Bad request
 */
router.post('/books', createBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     summary: Update book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               coverImage:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Buku berhasil diupdate
 *       404:
 *         description: Buku tidak ditemukan
 */
router.put('/books/:id', updateBook);

/**
 * @swagger
 * /api/admin/books/{id}/stock:
 *   put:
 *     summary: Update stock buku (tambah/kurang)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - quantity
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, subtract]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock berhasil diupdate
 *       400:
 *         description: Bad request
 *       404:
 *         description: Buku tidak ditemukan
 */
router.put('/books/:id/stock', updateStock);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     summary: Delete book (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Buku berhasil dihapus
 *       404:
 *         description: Buku tidak ditemukan
 */
router.delete('/books/:id', deleteBook);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions/orders with payment status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List transaksi berhasil diambil
 */
router.get('/transactions', getAllTransactions);

/**
 * @swagger
 * /api/admin/transactions/{id}:
 *   get:
 *     summary: Get transaction detail
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get('/transactions/:id', getTransactionDetail);

/**
 * @swagger
 * /api/admin/reports/sales:
 *   get:
 *     summary: Get sales report per book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Laporan penjualan berhasil diambil
 */
router.get('/reports/sales', getSalesReport);

/**
 * @swagger
 * /api/admin/reports/sales/{id}:
 *   get:
 *     summary: Get sales report by book ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Laporan penjualan buku berhasil diambil
 *       404:
 *         description: Buku tidak ditemukan
 */
router.get('/reports/sales/:id', getBookSalesReport);

module.exports = router;

