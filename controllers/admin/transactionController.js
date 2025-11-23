const { Order, OrderItem, Payment, User, Book } = require('../../models');
const { Op } = require('sequelize');
const { success, error } = require('../../helpers/response');

/**
 * Get all transactions/orders with payment status
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Filter by order status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'price']
          }]
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    // Filter by payment status if provided
    let filteredOrders = orders.rows;
    if (paymentStatus) {
      filteredOrders = orders.rows.filter(order => {
        const payment = order.payments && order.payments[0];
        return payment && payment.status === paymentStatus;
      });
    }

    const totalPages = Math.ceil(orders.count / parseInt(limit));

    return success(res, {
      transactions: filteredOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.count,
        totalPages
      }
    });
  } catch (err) {
    console.error('Get all transactions error:', err);
    return error(res, 'Error saat mengambil list transaksi', 500, err);
  }
};

/**
 * Get transaction detail
 */
const getTransactionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'role']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'price', 'stock']
          }]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    if (!order) {
      return error(res, 'Transaksi tidak ditemukan', 404);
    }

    return success(res, order);
  } catch (err) {
    console.error('Get transaction detail error:', err);
    return error(res, 'Error saat mengambil detail transaksi', 500, err);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionDetail
};

