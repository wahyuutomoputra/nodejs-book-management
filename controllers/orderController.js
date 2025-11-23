const { Order, OrderItem, Cart, Book, Payment } = require('../models');
const { Op } = require('sequelize');
const { success, error, badRequest, notFound } = require('../helpers/response');
const sequelize = require('../config/database');

/**
 * Generate order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Checkout - Create order from cart
 */
const checkout = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    // Get cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Book,
        as: 'book'
      }],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return badRequest(res, 'Keranjang kosong');
    }

    // Validate stock dan calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const book = cartItem.book;

      // Cek stock
      if (book.stock < cartItem.quantity) {
        await transaction.rollback();
        return badRequest(res, `Stock tidak mencukupi untuk buku "${book.title}". Stock tersedia: ${book.stock}`);
      }

      const price = parseFloat(book.price);
      const subtotal = price * cartItem.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        bookId: book.id,
        quantity: cartItem.quantity,
        price: price,
        subtotal: subtotal
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      userId,
      orderNumber,
      totalAmount: totalAmount.toFixed(2),
      status: 'pending',
      shippingAddress: shippingAddress || null
    }, { transaction });

    // Create order items dan update stock
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        bookId: itemData.bookId,
        quantity: itemData.quantity,
        price: itemData.price,
        subtotal: itemData.subtotal
      }, { transaction });

      // Update book stock
      await Book.decrement('stock', {
        by: itemData.quantity,
        where: { id: itemData.bookId },
        transaction
      });
    }

    // Clear cart
    await Cart.destroy({
      where: { userId },
      transaction
    });

    // Create payment record
    const payment = await Payment.create({
      orderId: order.id,
      amount: totalAmount.toFixed(2),
      status: 'pending'
    }, { transaction });

    await transaction.commit();

    // Get order with details
    const orderWithDetails = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'price', 'coverImage']
          }]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    return success(res, orderWithDetails, 'Checkout berhasil', 201);
  } catch (err) {
    await transaction.rollback();
    console.error('Checkout error:', err);
    return error(res, 'Error saat checkout', 500, err);
  }
};

/**
 * Get user orders
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'price', 'coverImage']
          }]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, orders);
  } catch (err) {
    console.error('Get orders error:', err);
    return error(res, 'Error saat mengambil orders', 500, err);
  }
};

/**
 * Get order detail
 */
const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        userId
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'price', 'coverImage']
          }]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    if (!order) {
      return notFound(res, 'Order tidak ditemukan');
    }

    return success(res, order);
  } catch (err) {
    console.error('Get order detail error:', err);
    return error(res, 'Error saat mengambil detail order', 500, err);
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderDetail
};

