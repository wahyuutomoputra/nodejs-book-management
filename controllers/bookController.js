const { Book } = require('../models');
const { Op } = require('sequelize');
const { success, error, notFound } = require('../helpers/response');

/**
 * Get list buku yang ready stock
 */
const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      stock: {
        [Op.gt]: 0 // Stock lebih dari 0
      }
    };

    // Search by title atau author
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return success(res, books, null, 200);
  } catch (err) {
    console.error('Get books error:', err);
    return error(res, 'Error saat mengambil list buku', 500, err);
  }
};

/**
 * Get detail buku by ID
 */
const getBookDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    // Cek apakah stock ready
    if (book.stock <= 0) {
      return success(res, {
        ...book.toJSON(),
        isStockReady: false
      }, 'Buku ditemukan tapi stock tidak tersedia');
    }

    return success(res, {
      ...book.toJSON(),
      isStockReady: true
    });
  } catch (err) {
    console.error('Get book detail error:', err);
    return error(res, 'Error saat mengambil detail buku', 500, err);
  }
};

module.exports = {
  getBooks,
  getBookDetail
};

