import { query } from './database';

export const resolvers = {
  Query: {
    vehicles: async () => {
      try {
        const result = await query('SELECT * FROM vehicles ORDER BY created_at DESC');
      
        const rows = result.rows || [];

        return rows.map((row: any) => ({
          ...row,
          V_type: row.v_type || row.V_type || 'Truck'
        }));
      } catch (err) {
        const errorMessage = (err as any)?.message || "Unknown Error";
        throw new Error(`Failed to fetch vehicles: ${errorMessage}`);
      }
    },
    vehicle: async (_: any, { id }: { id: string }) => {
      const result = await query('SELECT * FROM vehicles WHERE vehicle_id = $1', [id]);
      const row = result.rows[0];
      if (!row) return null;
      return {
        ...row,
        V_type: row.v_type || row.V_type || 'Truck'
      };
    },
    vehiclesByStatus: async (_: any, { status }: { status: string }) => {
      const result = await query('SELECT * FROM vehicles WHERE status = $1 ORDER BY created_at DESC', [status]);
      const rows = result.rows || [];
      return rows.map((row: any) => ({
        ...row,
        V_type: row.v_type || row.V_type || 'Truck'
      }));
    },
  },
  Mutation: {
    createVehicle: async (_: any, args: any) => {
      const { V_type, license_plate, capacity, status } = args;
      const typeToSave = V_type || 'Truck';
      
      const result = await query(
        'INSERT INTO vehicles (V_type, license_plate, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [typeToSave, license_plate, capacity, status]
      );
      const row = result.rows[0];
      return {
        ...row,
        V_type: row.v_type || typeToSave
      };
    },
    updateVehicle: async (_: any, args: any) => {
      const { id, ...updates } = args;
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          if (key === 'V_type') {
             fields.push(`V_type = $${paramCount}`); 
          } else {
             fields.push(`${key} = $${paramCount}`);
          }
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        const result = await query('SELECT * FROM vehicles WHERE vehicle_id = $1', [id]);
        const row = result.rows[0];
        if (!row) return null;
        return {
          ...row,
          V_type: row.v_type || 'Truck'
        };
      }

      values.push(id);
      const result = await query(
        `UPDATE vehicles SET ${fields.join(', ')} WHERE vehicle_id = $${paramCount} RETURNING *`,
        values
      );
      const row = result.rows[0];
      return {
        ...row,
        V_type: row.v_type || 'Truck'
      };
    },
    deleteVehicle: async (_: any, { id }: { id: string }) => {
      const result = await query('DELETE FROM vehicles WHERE vehicle_id = $1', [id]);
      // FIX: Menghindari tanda seru (!) yang kadang bikin merah
      return (result.rowCount || 0) > 0;
    },
  },
  Vehicle: {
    __resolveReference: async (reference: { vehicle_id: string }) => {
      const result = await query('SELECT * FROM vehicles WHERE vehicle_id = $1', [
        reference.vehicle_id,
      ]);
      const row = result.rows[0];
      if (!row) return null;
      return {
        ...row,
        V_type: row.v_type || 'Truck'
      };
    },
  },
};