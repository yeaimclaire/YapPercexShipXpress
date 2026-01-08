import { query } from './database';

export const resolvers = {
  Query: {
    drivers: async () => {
      const result = await query(
        'SELECT * FROM drivers ORDER BY created_at DESC'
      );
      return result.rows;
    },
    driver: async (_: any, { id }: { id: string }) => {
      const result = await query('SELECT * FROM drivers WHERE driver_id = $1', [id]);
      if (result.rows[0]) {
        return {
          ...result.rows[0],
          profile_photo: result.rows[0].profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.rows[0].name_driver)}&background=FAB12F&color=fff&size=200`
        };
      }
      return null;
    },
    driversByVehicle: async (_: any, { vehicle_id }: { vehicle_id: string }) => {
      const result = await query(
        'SELECT * FROM drivers WHERE vehicle_id = $1 ORDER BY created_at DESC',
        [vehicle_id]
      );
      return result.rows;
    },
  },
  Mutation: {
    createDriver: async (_: any, args: any) => {
      const { name_driver, phone_driver, license_driver, vehicle_id, profile_photo } = args;
      const result = await query(
        'INSERT INTO drivers (name_driver, phone_driver, license_driver, vehicle_id, profile_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name_driver, phone_driver, license_driver, vehicle_id || null, profile_photo || null]
      );
      return result.rows[0];
    },
    updateDriver: async (_: any, args: any) => {
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
        const result = await query('SELECT * FROM drivers WHERE driver_id = $1', [id]);
        return result.rows[0];
      }

      values.push(id);
      const result = await query(
        `UPDATE drivers SET ${fields.join(', ')} WHERE driver_id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    },
    deleteDriver: async (_: any, { id }: { id: string }) => {
      const result = await query('DELETE FROM drivers WHERE driver_id = $1', [id]);
      return result.rowCount! > 0;
    },
  },
  Driver: {
    __resolveReference: async (reference: { driver_id: string }) => {
      const result = await query('SELECT * FROM drivers WHERE driver_id = $1', [
        reference.driver_id,
      ]);
      return result.rows[0];
    },
    vehicle: async (parent: any) => {
      if (!parent.vehicle_id) return null;
      // This will be resolved by Vehicle service through federation
      return { vehicle_id: parent.vehicle_id };
    },
  },
};

