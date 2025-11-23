const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorLog = sequelize.define('ErrorLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  errorStack: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestBody: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestHeaders: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'error_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['statusCode']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = ErrorLog;

