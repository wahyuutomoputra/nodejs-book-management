'use strict';

const { User } = require('../models');

/**
 * Seed users (customer dan admin)
 * Note: Password akan otomatis di-hash oleh hook beforeCreate/beforeUpdate di model User
 */
const seedUsers = async () => {
  try {
    // Check and create/update Admin
    let admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      admin = await User.create({
        email: 'admin@example.com',
        password: 'password123', // Plain password, akan di-hash otomatis oleh hook
        role: 'admin',
        name: 'Admin Example'
      });
      console.log('✅ Admin user berhasil dibuat');
    } else {
      // Update password jika sudah ada (akan di-hash otomatis oleh hook)
      admin.password = 'password123';
      await admin.save();
      console.log('✅ Admin user sudah ada, password diupdate');
    }
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');

    // Check and create/update Customer
    let customer = await User.findOne({ where: { email: 'customer@example.com' } });
    if (!customer) {
      customer = await User.create({
        email: 'customer@example.com',
        password: 'password123', // Plain password, akan di-hash otomatis oleh hook
        role: 'customer',
        name: 'Customer Example'
      });
      console.log('✅ Customer user berhasil dibuat');
    } else {
      // Update password jika sudah ada (akan di-hash otomatis oleh hook)
      customer.password = 'password123';
      await customer.save();
      console.log('✅ Customer user sudah ada, password diupdate');
    }
    console.log('   Email: customer@example.com');
    console.log('   Password: password123');

    console.log('✅ Seeding users selesai');
  } catch (error) {
    console.error('❌ Error saat seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
