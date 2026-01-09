const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const resolvers = {
  Query: {
    users: async () => {
      try {
        const [rows] = await pool.query('SELECT user_id, name, email, phone, address FROM users');
        return rows;
      } catch (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },

    user: async (_, { id }) => {
      try {
        const [rows] = await pool.query(
          'SELECT user_id, name, email, phone, address FROM users WHERE user_id = ?',
          [id]
        );
        if (rows.length === 0) {
          throw new Error('User not found');
        }
        return rows[0];
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },

    login: async (_, { email, password }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        
        if (rows.length === 0) {
          throw new Error('Invalid email or password');
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
          { userId: user.user_id, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Remove password from user object
        delete user.password;

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Login error: ${error.message}`);
      }
    }
  },

  Mutation: {
    registerUser: async (_, { input }) => {
      try {
        // Check if email already exists
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [input.email]
        );

        if (existingUsers.length > 0) {
          throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Insert user
        const [result] = await pool.query(
          'INSERT INTO users (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)',
          [input.name, input.email, input.phone || null, input.address || null, hashedPassword]
        );

        const userId = result.insertId;

        // Get created user
        const [rows] = await pool.query(
          'SELECT user_id, name, email, phone, address FROM users WHERE user_id = ?',
          [userId]
        );

        const user = rows[0];

        // Generate token
        const token = jwt.sign(
          { userId: user.user_id, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Registration error: ${error.message}`);
      }
    },

    updateUser: async (_, { id, input }) => {
      try {
        // Check if user exists
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE user_id = ?',
          [id]
        );

        if (existingUsers.length === 0) {
          throw new Error('User not found');
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (input.name) {
          updates.push('name = ?');
          values.push(input.name);
        }
        if (input.email) {
          updates.push('email = ?');
          values.push(input.email);
        }
        if (input.phone !== undefined) {
          updates.push('phone = ?');
          values.push(input.phone);
        }
        if (input.address !== undefined) {
          updates.push('address = ?');
          values.push(input.address);
        }
        if (input.password) {
          const hashedPassword = await bcrypt.hash(input.password, 10);
          updates.push('password = ?');
          values.push(hashedPassword);
        }

        if (updates.length === 0) {
          throw new Error('No fields to update');
        }

        values.push(id);

        await pool.query(
          `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
          values
        );

        // Get updated user
        const [rows] = await pool.query(
          'SELECT user_id, name, email, phone, address FROM users WHERE user_id = ?',
          [id]
        );

        return rows[0];
      } catch (error) {
        throw new Error(`Update error: ${error.message}`);
      }
    },

    deleteUser: async (_, { id }) => {
      try {
        const [result] = await pool.query(
          'DELETE FROM users WHERE user_id = ?',
          [id]
        );

        return result.affectedRows > 0;
      } catch (error) {
        throw new Error(`Delete error: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;

