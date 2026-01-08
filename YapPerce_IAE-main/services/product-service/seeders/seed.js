const { pool } = require('../config/database');

async function seed() {
  try {
    console.log('Seeding Product Service database...');

    // Insert categories
    await pool.query(`
      INSERT INTO categories (category_name) VALUES
      ('Electronics'),
      ('Clothing'),
      ('Food & Beverages'),
      ('Books'),
      ('Home & Garden')
      ON DUPLICATE KEY UPDATE category_name=VALUES(category_name)
    `);

    // Get category IDs
    const [categories] = await pool.query('SELECT category_id FROM categories');

    // Insert products (assuming user_id 1, 2, 3 exist from User Service)
    await pool.query(`
      INSERT INTO products (name, description, price, stock, category_id, user_id) VALUES
      ('Laptop ASUS', 'Laptop ASUS dengan spesifikasi tinggi', 8500000, 10, ?, 1),
      ('Smartphone Samsung', 'Smartphone Samsung dengan kamera 64MP', 5000000, 15, ?, 1),
      ('T-Shirt Premium', 'Kaos premium dengan bahan katun berkualitas', 150000, 50, ?, 2),
      ('Jeans Denim', 'Celana jeans denim dengan berbagai ukuran', 350000, 30, ?, 2),
      ('Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam', 25000, 100, ?, 3),
      ('Es Teh Manis', 'Es teh manis segar', 5000, 200, ?, 3),
      ('Buku Pemrograman', 'Buku tentang pemrograman JavaScript', 150000, 20, ?, 1),
      ('Buku Novel', 'Novel fiksi terbaru', 75000, 25, ?, 2),
      ('Pot Tanaman', 'Pot tanaman dengan desain modern', 50000, 40, ?, 3),
      ('Pupuk Organik', 'Pupuk organik untuk tanaman', 30000, 60, ?, 1)
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `, [
      categories[0].category_id, // Electronics
      categories[0].category_id, // Electronics
      categories[1].category_id, // Clothing
      categories[1].category_id, // Clothing
      categories[2].category_id, // Food & Beverages
      categories[2].category_id, // Food & Beverages
      categories[3].category_id, // Books
      categories[3].category_id, // Books
      categories[4].category_id, // Home & Garden
      categories[4].category_id  // Home & Garden
    ]);

    console.log('Product Service seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

