const { pool } = require('../config/database');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4010/graphql';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4011/graphql';
const SHIPXPRESS_URL = process.env.SHIPXPRESS_URL || 'http://localhost:4000/graphql';

// Helper function to fetch user from User Service
async function fetchUser(userId) {
  try {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          user_id
          name
          email
          address
        }
      }
    `;
    
    const response = await axios.post(USER_SERVICE_URL, {
      query,
      variables: { id: userId }
    });

    if (response.data.errors || !response.data.data.user) {
      return null;
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
}

// Helper function to fetch product from Product Service
async function fetchProduct(productId) {
  try {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          product_id
          name
          price
        }
      }
    `;
    
    const response = await axios.post(PRODUCT_SERVICE_URL, {
      query,
      variables: { id: productId }
    });

    if (response.data.errors || !response.data.data.product) {
      return null;
    }

    return response.data.data.product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }
}

// Helper function to update product stock in Product Service
async function updateProductStock(productId, quantity) {
  try {
    // Get current product with stock
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          product_id
          stock
        }
      }
    `;
    
    const response = await axios.post(PRODUCT_SERVICE_URL, {
      query,
      variables: { id: productId }
    });

    if (response.data.errors || !response.data.data.product) {
      throw new Error('Product not found');
    }

    const currentStock = response.data.data.product.stock;
    const newStock = currentStock - quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    // Update stock
    const updateMutation = `
      mutation UpdateStock($id: ID!, $stock: Int!) {
        updateStock(id: $id, stock: $stock) {
          product_id
          stock
        }
      }
    `;

    await axios.post(PRODUCT_SERVICE_URL, {
      query: updateMutation,
      variables: { id: productId, stock: newStock }
    });

    return true;
  } catch (error) {
    console.error('Error updating product stock:', error.message);
    throw error;
  }
}

// Helper function to send order to ShipXpress
async function sendOrderToShipXpress(order) {
  try {
    const mutation = `
      mutation CreateShipment(
        $customer_id: ID!
        $origin_address: String!
        $destination_address: String!
        $S_type: String!
        $weight: Float!
        $status: String!
        $vehicle_id: ID
      ) {
        createShipment(
          customer_id: $customer_id
          origin_address: $origin_address
          destination_address: $destination_address
          S_type: $S_type
          weight: $weight
          status: $status
          vehicle_id: $vehicle_id
        ) {
          shipment_id
          status
        }
      }
    `;

    const user = await fetchUser(order.user_id);
    if (!user) {
      throw new Error('User not found for shipment');
    }

    const totalWeight = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    // Get destination address from user, fallback to order shipping address if available
    let destinationAddress = user.address;
    if (!destinationAddress || destinationAddress === '-' || destinationAddress.trim() === '') {
      // Try to get from order if it has shipping address field
      // For now, use a default or throw error if address is required
      destinationAddress = '-';
    }

    const response = await axios.post(SHIPXPRESS_URL, {
      query: mutation,
      variables: {
        customer_id: order.user_id,
        origin_address: 'YapPerce Warehouse',
        destination_address: destinationAddress,
        S_type: 'Marketplace Order',
        weight: totalWeight || 1,
        status: 'Processing',
        vehicle_id: null
      }
    });

    if (response.data.errors || !response.data.data.createShipment) {
      throw new Error(response.data.errors?.[0]?.message || 'Failed to create shipment');
    }

    return response.data.data.createShipment;
  } catch (error) {
    console.error('Error sending order to ShipXpress:', error.message);
    throw error;
  }
}

async function fetchLatestTrackingStatus(shipmentId) {
  try {
    const query = `
      query TrackingUpdatesByShipment($shipment_id: ID!) {
        trackingUpdatesByShipment(shipment_id: $shipment_id) {
          status
          updated_at
        }
      }
    `;

    const response = await axios.post(SHIPXPRESS_URL, {
      query,
      variables: { shipment_id: shipmentId }
    });

    const updates = response.data?.data?.trackingUpdatesByShipment || [];
    if (!updates.length) {
      return null;
    }

    return updates[updates.length - 1].status;
  } catch (error) {
    console.error('Error fetching tracking status:', error.message);
    return null;
  }
}

const resolvers = {
  Query: {
    orders: async () => {
      try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
        return rows;
      } catch (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }
    },

    order: async (_, { id }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE order_id = ?',
          [id]
        );
        if (rows.length === 0) {
          throw new Error('Order not found');
        }
        return rows[0];
      } catch (error) {
        throw new Error(`Error fetching order: ${error.message}`);
      }
    },

    ordersByUser: async (_, { userId }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
          [userId]
        );
        return rows;
      } catch (error) {
        throw new Error(`Error fetching orders by user: ${error.message}`);
      }
    }
  },

  Mutation: {
    createOrder: async (_, { input }) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Calculate total amount
        let totalAmount = 0;
        for (const item of input.items) {
          totalAmount += item.price * item.quantity;
        }

        // Create order
        const [orderResult] = await connection.query(
          'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
          [input.user_id, totalAmount, 'Dipesan']
        );

        const orderId = orderResult.insertId;

        // Create order items and update stock
        for (const item of input.items) {
          await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price]
          );

          // Update stock in Product Service
          await updateProductStock(item.product_id, item.quantity);
        }

        await connection.commit();

        // Get created order
        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE order_id = ?',
          [orderId]
        );

        return rows[0];
      } catch (error) {
        await connection.rollback();
        throw new Error(`Error creating order: ${error.message}`);
      } finally {
        connection.release();
      }
    },

    updateOrderStatus: async (_, { id, status }) => {
      try {
        await pool.query(
          'UPDATE orders SET status = ? WHERE order_id = ?',
          [status, id]
        );

        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE order_id = ?',
          [id]
        );

        if (rows.length === 0) {
          throw new Error('Order not found');
        }

        return rows[0];
      } catch (error) {
        throw new Error(`Error updating order status: ${error.message}`);
      }
    },

    updateShipmentStatus: async (_, { id, shipmentStatus }) => {
      try {
        await pool.query(
          'UPDATE orders SET shipment_status = ? WHERE order_id = ?',
          [shipmentStatus, id]
        );

        // Update order status based on shipment status
        let orderStatus = 'Dalam Pengiriman';
        if (shipmentStatus === 'Delivered' || shipmentStatus === 'Selesai') {
          orderStatus = 'Selesai';
        }

        await pool.query(
          'UPDATE orders SET status = ? WHERE order_id = ?',
          [orderStatus, id]
        );

        const [rows] = await pool.query(
          'SELECT * FROM orders WHERE order_id = ?',
          [id]
        );

        if (rows.length === 0) {
          throw new Error('Order not found');
        }

        return rows[0];
      } catch (error) {
        throw new Error(`Error updating shipment status: ${error.message}`);
      }
    },

    sendOrderToShipXpress: async (_, { orderId }) => {
      try {
        // Get order with items
        const [orderRows] = await pool.query(
          'SELECT * FROM orders WHERE order_id = ?',
          [orderId]
        );

        if (orderRows.length === 0) {
          throw new Error('Order not found');
        }

        const order = orderRows[0];

        // Get order items
        const [itemRows] = await pool.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [orderId]
        );

        order.items = itemRows;

        // Send to ShipXpress
        const result = await sendOrderToShipXpress(order);

        // Update order status and store shipment_id
        await pool.query(
          'UPDATE orders SET status = ?, shipment_status = ?, shipment_id = ? WHERE order_id = ?',
          ['Dalam Pengiriman', result.status || 'Processing', result.shipment_id || null, orderId]
        );

        return !!result.shipment_id;
      } catch (error) {
        throw new Error(`Error sending order to ShipXpress: ${error.message}`);
      }
    }
  },

  Order: {
    order_date: (parent) => {
      // Ensure date is returned as ISO string
      if (parent.order_date instanceof Date) {
        return parent.order_date.toISOString();
      }
      // If it's a string, ensure it's valid ISO format
      if (typeof parent.order_date === 'string') {
        const date = new Date(parent.order_date);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      return parent.order_date;
    },

    user: async (parent) => {
      return await fetchUser(parent.user_id);
    },

    items: async (parent) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [parent.order_id]
        );
        return rows;
      } catch (error) {
        return [];
      }
    },

    shipment_status: async (parent) => {
      if (!parent.shipment_id) {
        return parent.shipment_status;
      }

      const latestStatus = await fetchLatestTrackingStatus(parent.shipment_id);
      if (!latestStatus) {
        return parent.shipment_status;
      }

      if (latestStatus !== parent.shipment_status) {
        let orderStatus = 'Dalam Pengiriman';
        if (latestStatus === 'Delivered' || latestStatus === 'Selesai') {
          orderStatus = 'Selesai';
        }

        await pool.query(
          'UPDATE orders SET shipment_status = ?, status = ? WHERE order_id = ?',
          [latestStatus, orderStatus, parent.order_id]
        );
      }

      return latestStatus;
    }
  },

  OrderItem: {
    product: async (parent) => {
      return await fetchProduct(parent.product_id);
    }
  }
};

module.exports = resolvers;

