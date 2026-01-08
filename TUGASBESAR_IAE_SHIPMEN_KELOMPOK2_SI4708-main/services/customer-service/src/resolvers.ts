import { query } from './database';

export const resolvers = {
  Query: {
    customers: async () => {
      const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
      // Mapping c_type (db) ke C_type (graphql)
      return result.rows.map((row: any) => ({
        ...row,
        C_type: row.c_type
      }));
    },
    customer: async (_: any, { id }: { id: string }) => {
      const result = await query('SELECT * FROM customers WHERE customer_id = $1', [id]);
      const row = result.rows[0];
      if (!row) return null;
      return {
        ...row,
        C_type: row.c_type
      };
    },
  },
  Mutation: {
    createCustomer: async (_: any, args: any) => {
      const { name, email, phone, address, C_type } = args;
      const result = await query(
        'INSERT INTO customers (name, email, phone, address, C_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, phone, address, C_type]
      );
      const row = result.rows[0];
      return {
        ...row,
        C_type: row.c_type
      };
    },
    updateCustomer: async (_: any, args: any) => {
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
        const result = await query('SELECT * FROM customers WHERE customer_id = $1', [id]);
        const row = result.rows[0];
        return {
          ...row,
          C_type: row.c_type
        };
      }

      values.push(id);
      const result = await query(
        `UPDATE customers SET ${fields.join(', ')} WHERE customer_id = $${paramCount} RETURNING *`,
        values
      );
      const row = result.rows[0];
      return {
        ...row,
        C_type: row.c_type
      };
    },
    deleteCustomer: async (_: any, { id }: { id: string }) => {
      const result = await query('DELETE FROM customers WHERE customer_id = $1', [id]);
      return result.rowCount! > 0;
    },
  },
  Customer: {
    __resolveReference: async (reference: { customer_id: string }) => {
      const result = await query('SELECT * FROM customers WHERE customer_id = $1', [
        reference.customer_id,
      ]);
      const row = result.rows[0];
      if (!row) return null;
      return {
        ...row,
        C_type: row.c_type
      };
    },
  },
};