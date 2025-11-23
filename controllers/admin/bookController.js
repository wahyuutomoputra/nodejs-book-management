const { Book } = require('../../models');
const { Op } = require('sequelize');
const { success, error, badRequest, notFound, created } = require('../../helpers/response');

/**
 * Get all books (admin) - tidak terbatas stock
 */
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Search by title atau author
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by isActive
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return success(res, {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages
      }
    });
  } catch (err) {
    console.error('Get all books error:', err);
    return error(res, 'Error saat mengambil list buku', 500, err);
  }
};

/**
 * Get book detail by ID (admin)
 */
const getBookDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    return success(res, book);
  } catch (err) {
    console.error('Get book detail error:', err);
    return error(res, 'Error saat mengambil detail buku', 500, err);
  }
};

/**
 * Create new book
 */
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, description, price, stock, coverImage } = req.body;

    // Validation
    if (!title || !author) {
      return badRequest(res, 'Title dan author harus diisi');
    }

    if (price === undefined || price < 0) {
      return badRequest(res, 'Price harus diisi dan tidak boleh negatif');
    }

    if (stock === undefined || stock < 0) {
      return badRequest(res, 'Stock harus diisi dan tidak boleh negatif');
    }

    // Check ISBN uniqueness if provided
    if (isbn) {
      const existingBook = await Book.findOne({ where: { isbn } });
      if (existingBook) {
        return badRequest(res, 'ISBN sudah digunakan');
      }
    }

    const book = await Book.create({
      title,
      author,
      isbn: isbn || null,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock),
      coverImage: coverImage || null,
      isActive: true
    });

    return created(res, book, 'Buku berhasil ditambahkan');
  } catch (err) {
    console.error('Create book error:', err);
    return error(res, 'Error saat menambahkan buku', 500, err);
  }
};

/**
 * Update book
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, description, price, stock, coverImage, isActive } = req.body;

    const book = await Book.findByPk(id);

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    // Check ISBN uniqueness if changed
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ where: { isbn } });
      if (existingBook) {
        return badRequest(res, 'ISBN sudah digunakan');
      }
    }

    // Update fields
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (isbn !== undefined) book.isbn = isbn || null;
    if (description !== undefined) book.description = description || null;
    if (price !== undefined) {
      if (price < 0) {
        return badRequest(res, 'Price tidak boleh negatif');
      }
      book.price = parseFloat(price);
    }
    if (stock !== undefined) {
      if (stock < 0) {
        return badRequest(res, 'Stock tidak boleh negatif');
      }
      book.stock = parseInt(stock);
    }
    if (coverImage !== undefined) book.coverImage = coverImage || null;
    if (isActive !== undefined) book.isActive = isActive;

    await book.save();

    return success(res, book, 'Buku berhasil diupdate');
  } catch (err) {
    console.error('Update book error:', err);
    return error(res, 'Error saat mengupdate buku', 500, err);
  }
};

/**
 * Update stock buku (tambah/kurang)
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity } = req.body; // action: 'add' or 'subtract'

    if (!action || !quantity) {
      return badRequest(res, 'Action dan quantity harus diisi');
    }

    if (!['add', 'subtract'].includes(action)) {
      return badRequest(res, "Action harus 'add' atau 'subtract'");
    }

    if (quantity <= 0) {
      return badRequest(res, 'Quantity harus lebih dari 0');
    }

    const book = await Book.findByPk(id);

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    if (action === 'add') {
      book.stock += parseInt(quantity);
    } else if (action === 'subtract') {
      if (book.stock < quantity) {
        return badRequest(res, `Stock tidak mencukupi. Stock saat ini: ${book.stock}`);
      }
      book.stock -= parseInt(quantity);
    }

    await book.save();

    return success(res, book, `Stock berhasil di${action === 'add' ? 'tambah' : 'kurang'}i`);
  } catch (err) {
    console.error('Update stock error:', err);
    return error(res, 'Error saat mengupdate stock', 500, err);
  }
};

/**
 * Delete book (soft delete - set isActive to false)
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    // Soft delete
    book.isActive = false;
    await book.save();

    return success(res, null, 'Buku berhasil dihapus dari katalog');
  } catch (err) {
    console.error('Delete book error:', err);
    return error(res, 'Error saat menghapus buku', 500, err);
  }
};

module.exports = {
  getAllBooks,
  getBookDetail,
  createBook,
  updateBook,
  updateStock,
  deleteBook
};

