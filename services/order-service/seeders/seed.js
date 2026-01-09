const { pool } = require('../config/database');

async function seed() {
  try {
    console.log('Seeding Order Service database...');

    // Insert orders (assuming users 1, 2, 3 exist)
    await pool.query(`
      INSERT INTO orders (user_id, total_amount, status, shipment_status) VALUES
      (1, 500000, 'Dipesan', NULL),
      (2, 750000, 'Dalam Pengiriman', 'Processing'),
      (3, 300000, 'Selesai', 'Delivered')
      ON DUPLICATE KEY UPDATE total_amount=VALUES(total_amount)
    `);

    // Get order IDs
    const [orders] = await pool.query('SELECT order_id FROM orders ORDER BY order_id');

    // Insert order items (assuming products 1-10 exist from Product Service)
    await pool.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
      (?, 1, 1, 8500000),
      (?, 3, 2, 150000),
      (?, 5, 3, 25000),
      (?, 7, 1, 150000),
      (?, 9, 2, 50000)
      ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)
    `, [
      orders[0].order_id,
      orders[1].order_id,
      orders[1].order_id,
      orders[2].order_id,
      orders[2].order_id
    ]);

    console.log('Order Service seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

