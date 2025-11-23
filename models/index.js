const User = require('./User');
const Session = require('./Session');
const Book = require('./Book');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const ErrorLog = require('./ErrorLog');

// User associations
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(ErrorLog, { foreignKey: 'userId', as: 'errorLogs' });

// Session associations
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Book associations
Book.hasMany(Cart, { foreignKey: 'bookId', as: 'carts' });
Book.hasMany(OrderItem, { foreignKey: 'bookId', as: 'orderItems' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Cart.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Payment associations
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// ErrorLog associations
ErrorLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Session,
  Book,
  Cart,
  Order,
  OrderItem,
  Payment,
  ErrorLog
};

