const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function seed() {
  try {
    console.log('Seeding User Service database...');

    // Hash passwords
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password123', 10);
    const hashedPassword3 = await bcrypt.hash('password123', 10);

    // Insert users
    await pool.query(`
      INSERT INTO users (name, email, phone, address, password) VALUES
      ('John Doe', 'john.doe@example.com', '081234567890', 'Jl. Merdeka No. 123, Jakarta', ?),
      ('Jane Smith', 'jane.smith@example.com', '081234567891', 'Jl. Sudirman No. 456, Jakarta', ?),
      ('Bob Johnson', 'bob.johnson@example.com', '081234567892', 'Jl. Thamrin No. 789, Jakarta', ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `, [hashedPassword1, hashedPassword2, hashedPassword3]);

    console.log('User Service seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

