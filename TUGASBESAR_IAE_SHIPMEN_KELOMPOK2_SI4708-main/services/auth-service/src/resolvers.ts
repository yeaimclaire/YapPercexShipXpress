import { query } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shipxpress-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const resolvers = {
  Query: {
    users: async () => {
      const result = await query(
        'SELECT user_id, username, email, role, full_name, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    },
    user: async (_: any, { id }: { id: string }) => {
      const result = await query(
        'SELECT user_id, username, email, role, full_name, created_at, updated_at FROM users WHERE user_id = $1',
        [id]
      );
      return result.rows[0] || null;
    },
    me: async (_: any, __: any, context: any) => {
      // This would require authentication middleware to extract user from token
      // For now, returning null - can be enhanced with proper auth context
      return null;
    },
  },
  Mutation: {
    register: async (_: any, args: any) => {
      const { username, email, password, full_name, role = 'user' } = args;

      // Check if user already exists
      const existingUser = await query(
        'SELECT user_id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const result = await query(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, role, full_name, created_at, updated_at',
        [username, email, passwordHash, full_name || null, role]
      );

      const user = result.rows[0];

      // Generate JWT token
      const payload = { user_id: user.user_id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

      return {
        token,
        user,
      };
    },
    login: async (_: any, args: any) => {
      const { email, password } = args;

      // Find user by email
      const result = await query(
        'SELECT user_id, username, email, password_hash, role, full_name, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Remove password_hash from response
      delete user.password_hash;

      // Generate JWT token
      const payload = { user_id: user.user_id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

      return {
        token,
        user,
      };
    },
    updateUser: async (_: any, args: any) => {
      const { id, ...updates } = args;
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        const result = await query(
          'SELECT user_id, username, email, role, full_name, created_at, updated_at FROM users WHERE user_id = $1',
          [id]
        );
        return result.rows[0];
      }

      // Add updated_at
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      values.push(id);
      const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING user_id, username, email, role, full_name, created_at, updated_at`,
        values
      );

      return result.rows[0];
    },
    changePassword: async (_: any, args: any) => {
      const { id, oldPassword, newPassword } = args;

      // Get current user
      const userResult = await query(
        'SELECT password_hash FROM users WHERE user_id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid old password');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [newPasswordHash, id]
      );

      return true;
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      const result = await query('DELETE FROM users WHERE user_id = $1', [id]);
      return result.rowCount! > 0;
    },
  },
  User: {
    __resolveReference: async (reference: { user_id: string }) => {
      const result = await query(
        'SELECT user_id, username, email, role, full_name, created_at, updated_at FROM users WHERE user_id = $1',
        [reference.user_id]
      );
      return result.rows[0];
    },
  },
};
