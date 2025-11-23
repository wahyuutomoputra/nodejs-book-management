'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('error_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      errorStack: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requestBody: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requestHeaders: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('error_logs', ['userId'], {
      name: 'error_logs_userId'
    });

    await queryInterface.addIndex('error_logs', ['statusCode'], {
      name: 'error_logs_statusCode'
    });

    await queryInterface.addIndex('error_logs', ['createdAt'], {
      name: 'error_logs_createdAt'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('error_logs');
  }
};

