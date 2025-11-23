const fs = require('fs');
const path = require('path');

/**
 * Menjalankan semua seeder
 */
const runSeeders = async () => {
  try {
    const seedersPath = path.join(__dirname, '../seeders');
    
    // Cek apakah folder seeders ada
    if (!fs.existsSync(seedersPath)) {
      console.log('⚠️  Folder seeders tidak ditemukan, membuat folder...');
      fs.mkdirSync(seedersPath, { recursive: true });
      console.log('✅ Tidak ada seeder yang perlu dijalankan');
      return;
    }

    const seederFiles = fs.readdirSync(seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Urutkan berdasarkan nama file

    if (seederFiles.length === 0) {
      console.log('✅ Tidak ada seeder yang perlu dijalankan');
      return;
    }

    console.log('🌱 Menjalankan seeders...');

    for (const file of seederFiles) {
      try {
        console.log(`🔄 Menjalankan seeder: ${file}`);
        const seeder = require(path.join(seedersPath, file));
        await seeder();
      } catch (error) {
        console.error(`❌ Error saat menjalankan seeder ${file}:`, error);
        // Continue dengan seeder berikutnya
      }
    }

    console.log('✅ Semua seeder selesai');
  } catch (error) {
    console.error('❌ Error saat menjalankan seeders:', error);
    throw error;
  }
};

module.exports = { runSeeders };

