const { Book, OrderItem, Order, Payment } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const { success, error } = require('../../helpers/response');

/**
 * Get sales report per book
 */
const getSalesReport = async (req, res) => {
  try {
    const { bookId, startDate, endDate } = req.query;

    let where = {};

    // Filter by book ID if provided
    if (bookId) {
      where.bookId = bookId;
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

    // Get all books or specific book
    const books = bookId 
      ? [await Book.findByPk(bookId)]
      : await Book.findAll({
          where: { isActive: true }
        });

    if (!books || (bookId && !books[0])) {
      return error(res, 'Buku tidak ditemukan', 404);
    }

    const reports = await Promise.all(
      books.map(async (book) => {
        if (!book) return null;

        // Get order items for this book
        const orderItems = await OrderItem.findAll({
          where: {
            bookId: book.id,
            ...where
          },
          include: [
            {
              model: Order,
              as: 'order',
              include: [{
                model: Payment,
                as: 'payments'
              }]
            }
          ]
        });

        // Filter hanya order items dengan payment success
        const successfulOrderItems = orderItems.filter(item => {
          const payment = item.order.payments && item.order.payments[0];
          return payment && payment.status === 'success';
        });

        // Calculate statistics
        let totalSold = 0;
        let totalRevenue = 0;

        successfulOrderItems.forEach(item => {
          totalSold += item.quantity;
          totalRevenue += parseFloat(item.subtotal);
        });

        return {
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            price: parseFloat(book.price)
          },
          totalSold,
          remainingStock: book.stock,
          totalRevenue: totalRevenue.toFixed(2),
          orderCount: successfulOrderItems.length
        };
      })
    );

    // Filter out null values
    const filteredReports = reports.filter(r => r !== null);

    // Calculate summary
    const summary = {
      totalBooks: filteredReports.length,
      totalSold: filteredReports.reduce((sum, r) => sum + r.totalSold, 0),
      totalRevenue: filteredReports.reduce((sum, r) => sum + parseFloat(r.totalRevenue), 0).toFixed(2)
    };

    return success(res, {
      reports: filteredReports,
      summary
    });
  } catch (err) {
    console.error('Get sales report error:', err);
    return error(res, 'Error saat mengambil laporan penjualan', 500, err);
  }
};

/**
 * Get sales report by book ID
 */
const getBookSalesReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const book = await Book.findByPk(id);

    if (!book) {
      return error(res, 'Buku tidak ditemukan', 404);
    }

    let where = {
      bookId: book.id
    };

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

    // Get order items for this book
    const orderItems = await OrderItem.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          include: [{
            model: Payment,
            as: 'payments'
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter hanya order items dengan payment success
    const successfulOrderItems = orderItems.filter(item => {
      const payment = item.order.payments && item.order.payments[0];
      return payment && payment.status === 'success';
    });

    // Calculate statistics
    let totalSold = 0;
    let totalRevenue = 0;

    successfulOrderItems.forEach(item => {
      totalSold += item.quantity;
      totalRevenue += parseFloat(item.subtotal);
    });

    return success(res, {
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        price: parseFloat(book.price)
      },
      totalSold,
      remainingStock: book.stock,
      totalRevenue: totalRevenue.toFixed(2),
      orderCount: successfulOrderItems.length,
      orderItems: successfulOrderItems.map(item => ({
        orderNumber: item.order.orderNumber,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
        orderDate: item.order.createdAt,
        paymentStatus: item.order.payments && item.order.payments[0] ? item.order.payments[0].status : null
      }))
    });
  } catch (err) {
    console.error('Get book sales report error:', err);
    return error(res, 'Error saat mengambil laporan penjualan buku', 500, err);
  }
};

module.exports = {
  getSalesReport,
  getBookSalesReport
};

