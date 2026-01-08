const { pool } = require('../config/database');

async function seed() {
  try {
    console.log('Seeding Payment Service database...');

    // Insert payments (assuming orders 1, 2, 3 exist from Order Service)
    await pool.query(`
      INSERT INTO payments (order_id, amount, payment_status) VALUES
      (1, 500000, 'Berhasil'),
      (2, 750000, 'Berhasil'),
      (3, 300000, 'Tertunda')
      ON DUPLICATE KEY UPDATE amount=VALUES(amount)
    `);

    console.log('Payment Service seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

