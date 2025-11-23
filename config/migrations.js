const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database');

/**
 * Menjalankan semua migrasi yang belum dijalankan
 */
const runMigrations = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Buat tabel SequelizeMeta jika belum ada (untuk tracking migrasi)
    try {
      await queryInterface.createTable('SequelizeMeta', {
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          primaryKey: true
        }
      });
      console.log('📋 Tabel SequelizeMeta dibuat');
    } catch (error) {
      // Tabel sudah ada, skip
      const errorMessage = error.message || error.toString();
      if (!errorMessage.includes('already exists') && 
          !errorMessage.includes('Table') && 
          !errorMessage.includes('ER_TABLE_EXISTS_ERROR')) {
        throw error;
      }
    }

    // Baca semua file migrasi
    const migrationsPath = path.join(__dirname, '../migrations');
    
    // Cek apakah folder migrations ada
    if (!fs.existsSync(migrationsPath)) {
      console.log('⚠️  Folder migrations tidak ditemukan, membuat folder...');
      fs.mkdirSync(migrationsPath, { recursive: true });
      console.log('✅ Tidak ada migrasi yang perlu dijalankan');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Urutkan berdasarkan nama file

    if (migrationFiles.length === 0) {
      console.log('✅ Tidak ada migrasi yang perlu dijalankan');
      return;
    }

    // Cek migrasi yang sudah dijalankan
    let executedNames = [];
    try {
      const executedMigrations = await sequelize.query(
        'SELECT name FROM SequelizeMeta',
        { type: Sequelize.QueryTypes.SELECT }
      );
      // Handle both array formats: [results] or results directly
      const results = Array.isArray(executedMigrations[0]) ? executedMigrations[0] : executedMigrations;
      executedNames = results.map(m => m.name);
    } catch (error) {
      // Tabel belum ada atau error, anggap belum ada migrasi yang dijalankan
      executedNames = [];
    }

    let migrationsRun = 0;

    // Jalankan migrasi yang belum dijalankan
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`🔄 Menjalankan migrasi: ${file}`);
        const migration = require(path.join(migrationsPath, file));
        
        try {
          await migration.up(queryInterface, Sequelize);
          
          // Simpan ke SequelizeMeta (gunakan parameterized query untuk keamanan)
          try {
            await sequelize.query(
              'INSERT INTO SequelizeMeta (name) VALUES (?)',
              {
                replacements: [file],
                type: Sequelize.QueryTypes.INSERT
              }
            );
            console.log(`✅ Migrasi ${file} berhasil dijalankan`);
            migrationsRun++;
          } catch (insertError) {
            // Handle duplicate entry - mungkin migrasi sudah ada di meta tapi tidak terdeteksi
            if (insertError.original && insertError.original.code === 'ER_DUP_ENTRY') {
              console.log(`⚠️  Migrasi ${file} sudah ada di SequelizeMeta, skip insert...`);
              migrationsRun++;
            } else {
              throw insertError;
            }
          }
        } catch (migrationError) {
          // Handle duplicate key error - mungkin index/constraint sudah ada
          if (migrationError.original && 
              (migrationError.original.code === 'ER_DUP_KEYNAME' || 
               migrationError.original.code === 'ER_DUP_ENTRY')) {
            console.log(`⚠️  Migrasi ${file} memiliki duplicate key/index yang sudah ada, skip...`);
            // Tetap simpan ke SequelizeMeta jika belum ada
            try {
              await sequelize.query(
                'INSERT INTO SequelizeMeta (name) VALUES (?)',
                {
                  replacements: [file],
                  type: Sequelize.QueryTypes.INSERT
                }
              );
              console.log(`✅ Migrasi ${file} ditandai sebagai sudah dijalankan`);
              migrationsRun++;
            } catch (metaError) {
              // Ignore jika sudah ada di meta
              if (metaError.original && metaError.original.code !== 'ER_DUP_ENTRY') {
                throw metaError;
              }
            }
          } else {
            throw migrationError;
          }
        }
      } else {
        console.log(`⏭️  Migrasi ${file} sudah dijalankan sebelumnya`);
      }
    }

    if (migrationsRun > 0) {
      console.log(`✅ ${migrationsRun} migrasi baru berhasil dijalankan`);
    } else {
      console.log('✅ Semua migrasi sudah up-to-date');
    }
  } catch (error) {
    console.error('❌ Error saat menjalankan migrasi:', error);
    throw error;
  }
};

module.exports = { runMigrations };

