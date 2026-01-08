import { query } from './database';

export const resolvers = {
  Query: {
    trackingUpdates: async () => {
      const result = await query(
        'SELECT * FROM tracking_updates ORDER BY updated_at DESC'
      );
      return result.rows;
    },
    trackingUpdate: async (_: any, { id }: { id: string }) => {
      const result = await query('SELECT * FROM tracking_updates WHERE tracking_id = $1', [id]);
      return result.rows[0] || null;
    },
    trackingUpdatesByShipment: async (_: any, { shipment_id }: { shipment_id: string }) => {
      const result = await query(
        'SELECT * FROM tracking_updates WHERE shipment_id = $1 ORDER BY updated_at ASC',
        [shipment_id]
      );
      return result.rows;
    },
    trackingUpdatesByStatus: async (_: any, { status }: { status: string }) => {
      const result = await query(
        'SELECT * FROM tracking_updates WHERE status = $1 ORDER BY updated_at DESC',
        [status]
      );
      return result.rows;
    },
  },
  Mutation: {
    createTrackingUpdate: async (_: any, args: any) => {
      const { shipment_id, location, status, recipient_name, recipient_phone, recipient_address, item_name, barcode } = args;
      const result = await query(
        'INSERT INTO tracking_updates (shipment_id, location, status, recipient_name, recipient_phone, recipient_address, item_name, barcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [shipment_id, location, status, recipient_name || null, recipient_phone || null, recipient_address || null, item_name || null, barcode || null]
      );
      return result.rows[0];
    },
    updateTrackingUpdate: async (_: any, args: any) => {
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
        const result = await query('SELECT * FROM tracking_updates WHERE tracking_id = $1', [id]);
        return result.rows[0];
      }

      values.push(id);
      const result = await query(
        `UPDATE tracking_updates SET ${fields.join(', ')} WHERE tracking_id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    },
    deleteTrackingUpdate: async (_: any, { id }: { id: string }) => {
      const result = await query('DELETE FROM tracking_updates WHERE tracking_id = $1', [id]);
      return result.rowCount! > 0;
    },
  },
  TrackingUpdate: {
    __resolveReference: async (reference: { tracking_id: string }) => {
      const result = await query('SELECT * FROM tracking_updates WHERE tracking_id = $1', [
        reference.tracking_id,
      ]);
      return result.rows[0];
    },
    shipment: async (parent: any) => {
      if (!parent.shipment_id) return null;
      return { shipment_id: parent.shipment_id };
    },
  },
  Shipment: {
    trackingUpdates: async (parent: { shipment_id: string }) => {
      const result = await query(
        'SELECT * FROM tracking_updates WHERE shipment_id = $1 ORDER BY updated_at DESC',
        [parent.shipment_id]
      );
      return result.rows;
    },
  },
};

