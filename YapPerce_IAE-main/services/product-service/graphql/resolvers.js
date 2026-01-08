const { pool } = require('../config/database');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4010/graphql';

// Helper function to fetch user from User Service
async function fetchUser(userId) {
  try {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          user_id
          name
          email
        }
      }
    `;
    
    const response = await axios.post(USER_SERVICE_URL, {
      query,
      variables: { id: userId }
    });

    if (response.data.errors) {
      return null;
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
}

const resolvers = {
  Query: {
    products: async () => {
      try {
        const [rows] = await pool.query('SELECT * FROM products');
        return rows;
      } catch (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }
    },

    product: async (_, { id }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM products WHERE product_id = ?',
          [id]
        );
        if (rows.length === 0) {
          throw new Error('Product not found');
        }
        return rows[0];
      } catch (error) {
        throw new Error(`Error fetching product: ${error.message}`);
      }
    },

    productsByCategory: async (_, { categoryId }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM products WHERE category_id = ?',
          [categoryId]
        );
        return rows;
      } catch (error) {
        throw new Error(`Error fetching products by category: ${error.message}`);
      }
    },

    productsBySeller: async (_, { userId }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM products WHERE user_id = ?',
          [userId]
        );
        return rows;
      } catch (error) {
        throw new Error(`Error fetching products by seller: ${error.message}`);
      }
    },

    categories: async () => {
      try {
        const [rows] = await pool.query('SELECT * FROM categories');
        return rows;
      } catch (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }
    },

    category: async (_, { id }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [id]
        );
        if (rows.length === 0) {
          throw new Error('Category not found');
        }
        return rows[0];
      } catch (error) {
        throw new Error(`Error fetching category: ${error.message}`);
      }
    }
  },

  Mutation: {
    createProduct: async (_, { input }) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO products (name, description, price, stock, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [input.name, input.description || null, input.price, input.stock, input.category_id || null, input.user_id]
        );

        const productId = result.insertId;
        const [rows] = await pool.query(
          'SELECT * FROM products WHERE product_id = ?',
          [productId]
        );

        return rows[0];
      } catch (error) {
        throw new Error(`Error creating product: ${error.message}`);
      }
    },

    updateProduct: async (_, { id, input }) => {
      try {
        await pool.query(
          'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE product_id = ?',
          [input.name, input.description || null, input.price, input.stock, input.category_id || null, id]
        );

        const [rows] = await pool.query(
          'SELECT * FROM products WHERE product_id = ?',
          [id]
        );

        if (rows.length === 0) {
          throw new Error('Product not found');
        }

        return rows[0];
      } catch (error) {
        throw new Error(`Error updating product: ${error.message}`);
      }
    },

    deleteProduct: async (_, { id }) => {
      try {
        const [result] = await pool.query(
          'DELETE FROM products WHERE product_id = ?',
          [id]
        );

        return result.affectedRows > 0;
      } catch (error) {
        throw new Error(`Error deleting product: ${error.message}`);
      }
    },

    updateStock: async (_, { id, stock }) => {
      try {
        await pool.query(
          'UPDATE products SET stock = ? WHERE product_id = ?',
          [stock, id]
        );

        const [rows] = await pool.query(
          'SELECT * FROM products WHERE product_id = ?',
          [id]
        );

        if (rows.length === 0) {
          throw new Error('Product not found');
        }

        return rows[0];
      } catch (error) {
        throw new Error(`Error updating stock: ${error.message}`);
      }
    },

    createCategory: async (_, { categoryName }) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO categories (category_name) VALUES (?)',
          [categoryName]
        );

        const categoryId = result.insertId;
        const [rows] = await pool.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [categoryId]
        );

        return rows[0];
      } catch (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }
    }
  },

  Product: {
    category: async (parent) => {
      if (!parent.category_id) return null;
      try {
        const [rows] = await pool.query(
          'SELECT * FROM categories WHERE category_id = ?',
          [parent.category_id]
        );
        return rows.length > 0 ? rows[0] : null;
      } catch (error) {
        return null;
      }
    },

    seller: async (parent) => {
      if (!parent.user_id) return null;
      return await fetchUser(parent.user_id);
    }
  }
};

module.exports = resolvers;

