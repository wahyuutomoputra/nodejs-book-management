const { Cart, Book } = require('../models');
const { Op } = require('sequelize');
const { success, error, badRequest, notFound } = require('../helpers/response');

/**
 * Get cart items user
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author', 'price', 'stock', 'coverImage']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate total
    let total = 0;
    const items = cartItems.map(item => {
      const itemTotal = parseFloat(item.book.price) * item.quantity;
      total += itemTotal;
      return {
        id: item.id,
        book: item.book,
        quantity: item.quantity,
        subtotal: itemTotal,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    return success(res, {
      items,
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error('Get cart error:', err);
    return error(res, 'Error saat mengambil keranjang', 500, err);
  }
};

/**
 * Add book to cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return badRequest(res, 'Book ID harus diisi');
    }

    if (quantity < 1) {
      return badRequest(res, 'Quantity minimal 1');
    }

    // Cek apakah buku ada dan stock mencukupi
    const book = await Book.findOne({
      where: {
        id: bookId,
        isActive: true
      }
    });

    if (!book) {
      return notFound(res, 'Buku tidak ditemukan');
    }

    if (book.stock < quantity) {
      return badRequest(res, `Stock tidak mencukupi. Stock tersedia: ${book.stock}`);
    }

    // Cek apakah sudah ada di cart
    const existingCart = await Cart.findOne({
      where: {
        userId,
        bookId
      }
    });

    if (existingCart) {
      // Update quantity jika sudah ada
      const newQuantity = existingCart.quantity + quantity;
      
      if (book.stock < newQuantity) {
        return badRequest(res, `Stock tidak mencukupi. Stock tersedia: ${book.stock}, quantity di keranjang: ${existingCart.quantity}`);
      }

      existingCart.quantity = newQuantity;
      await existingCart.save();

      return success(res, existingCart, 'Buku berhasil ditambahkan ke keranjang');
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId,
      bookId,
      quantity
    });

    const cartWithBook = await Cart.findByPk(cartItem.id, {
      include: [{
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author', 'price', 'stock', 'coverImage']
      }]
    });

    return success(res, cartWithBook, 'Buku berhasil ditambahkan ke keranjang', 201);
  } catch (err) {
    console.error('Add to cart error:', err);
    return error(res, 'Error saat menambahkan buku ke keranjang', 500, err);
  }
};

/**
 * Remove book from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Cart item ID

    const cartItem = await Cart.findOne({
      where: {
        id,
        userId
      }
    });

    if (!cartItem) {
      return notFound(res, 'Item tidak ditemukan di keranjang');
    }

    await cartItem.destroy();

    return success(res, null, 'Buku berhasil dihapus dari keranjang');
  } catch (err) {
    console.error('Remove from cart error:', err);
    return error(res, 'Error saat menghapus buku dari keranjang', 500, err);
  }
};

/**
 * Update cart item quantity
 */
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return badRequest(res, 'Quantity minimal 1');
    }

    const cartItem = await Cart.findOne({
      where: {
        id,
        userId
      },
      include: [{
        model: Book,
        as: 'book'
      }]
    });

    if (!cartItem) {
      return notFound(res, 'Item tidak ditemukan di keranjang');
    }

    // Cek stock
    if (cartItem.book.stock < quantity) {
      return badRequest(res, `Stock tidak mencukupi. Stock tersedia: ${cartItem.book.stock}`);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return success(res, cartItem, 'Quantity berhasil diupdate');
  } catch (err) {
    console.error('Update cart quantity error:', err);
    return error(res, 'Error saat mengupdate quantity', 500, err);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity
};

