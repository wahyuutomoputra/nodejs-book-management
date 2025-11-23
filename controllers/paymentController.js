const { Payment, Order } = require('../models');
const { success, error, badRequest, notFound } = require('../helpers/response');
const sequelize = require('../config/database');

/**
 * Payment callback - Update payment status
 * Endpoint ini bisa dipanggil oleh payment gateway untuk update status pembayaran
 */
const paymentCallback = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId, status, paymentReference, callbackData } = req.body;

    if (!orderId || !status) {
      await transaction.rollback();
      return badRequest(res, 'Order ID dan status harus diisi');
    }

    // Validate status
    const validStatuses = ['pending', 'success', 'failed'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return badRequest(res, `Status tidak valid. Status yang valid: ${validStatuses.join(', ')}`);
    }

    // Find order
    const order = await Order.findByPk(orderId, { transaction });

    if (!order) {
      await transaction.rollback();
      return notFound(res, 'Order tidak ditemukan');
    }

    // Find payment
    const payment = await Payment.findOne({
      where: { orderId },
      transaction
    });

    if (!payment) {
      await transaction.rollback();
      return notFound(res, 'Payment tidak ditemukan');
    }

    // Update payment status
    payment.status = status;
    if (paymentReference) {
      payment.paymentReference = paymentReference;
    }
    if (callbackData) {
      payment.callbackData = typeof callbackData === 'string' ? callbackData : JSON.stringify(callbackData);
    }
    await payment.save({ transaction });

    // Update order status berdasarkan payment status
    if (status === 'success') {
      order.status = 'processing';
      await order.save({ transaction });
    } else if (status === 'failed') {
      // Jika payment failed, bisa rollback stock (optional)
      // Untuk sekarang, order tetap pending
      order.status = 'pending';
      await order.save({ transaction });
    }

    await transaction.commit();

    return success(res, {
      payment: payment.toJSON(),
      order: order.toJSON()
    }, 'Payment status berhasil diupdate');
  } catch (err) {
    await transaction.rollback();
    console.error('Payment callback error:', err);
    return error(res, 'Error saat update payment status', 500, err);
  }
};

/**
 * Get payment status by order ID
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify order belongs to user
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return notFound(res, 'Order tidak ditemukan');
    }

    const payment = await Payment.findOne({
      where: { orderId }
    });

    if (!payment) {
      return notFound(res, 'Payment tidak ditemukan');
    }

    return success(res, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      payment: payment.toJSON()
    });
  } catch (err) {
    console.error('Get payment status error:', err);
    return error(res, 'Error saat mengambil payment status', 500, err);
  }
};

module.exports = {
  paymentCallback,
  getPaymentStatus
};

