const { pool } = require('../config/database');
const axios = require('axios');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4012/graphql';

// Helper function to fetch order from Order Service
async function fetchOrder(orderId) {
  try {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          order_id
          user_id
          total_amount
          status
        }
      }
    `;
    
    const response = await axios.post(ORDER_SERVICE_URL, {
      query,
      variables: { id: orderId }
    });

    if (response.data.errors || !response.data.data.order) {
      return null;
    }

    return response.data.data.order;
  } catch (error) {
    console.error('Error fetching order:', error.message);
    return null;
  }
}

// Helper function to send order to ShipXpress after successful payment
async function sendOrderToShipXpress(orderId) {
  try {
    const mutation = `
      mutation SendOrderToShipXpress($orderId: ID!) {
        sendOrderToShipXpress(orderId: $orderId)
      }
    `;

    const response = await axios.post(ORDER_SERVICE_URL, {
      query: mutation,
      variables: { orderId }
    });

    if (response.data.errors) {
      console.error('Error sending order to ShipXpress:', response.data.errors);
      return false;
    }

    return response.data.data.sendOrderToShipXpress;
  } catch (error) {
    console.error('Error sending order to ShipXpress:', error.message);
    return false;
  }
}

const resolvers = {
  Query: {
    payments: async () => {
      try {
        const [rows] = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
        return rows;
      } catch (error) {
        throw new Error(`Error fetching payments: ${error.message}`);
      }
    },

    payment: async (_, { id }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE payment_id = ?',
          [id]
        );
        if (rows.length === 0) {
          throw new Error('Payment not found');
        }
        return rows[0];
      } catch (error) {
        throw new Error(`Error fetching payment: ${error.message}`);
      }
    },

    paymentsByOrder: async (_, { orderId }) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE order_id = ? ORDER BY payment_date DESC',
          [orderId]
        );
        return rows;
      } catch (error) {
        throw new Error(`Error fetching payments by order: ${error.message}`);
      }
    }
  },

  Mutation: {
    createPayment: async (_, { input }) => {
      try {
        // Verify order exists and get order details
        const order = await fetchOrder(input.order_id);
        if (!order) {
          throw new Error('Order not found');
        }

        // Verify amount matches order total
        if (Math.abs(input.amount - parseFloat(order.total_amount)) > 0.01) {
          throw new Error('Payment amount does not match order total');
        }

        // Create payment with pending status
        const [result] = await pool.query(
          'INSERT INTO payments (order_id, amount, payment_status) VALUES (?, ?, ?)',
          [input.order_id, input.amount, 'Tertunda']
        );

        const paymentId = result.insertId;

        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE payment_id = ?',
          [paymentId]
        );

        return rows[0];
      } catch (error) {
        throw new Error(`Error creating payment: ${error.message}`);
      }
    },

    updatePaymentStatus: async (_, { id, status }) => {
      try {
        await pool.query(
          'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
          [status, id]
        );

        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE payment_id = ?',
          [id]
        );

        if (rows.length === 0) {
          throw new Error('Payment not found');
        }

        // If payment is successful, send order to ShipXpress
        if (status === 'Berhasil' && rows[0].order_id) {
          await sendOrderToShipXpress(rows[0].order_id);
        }

        return rows[0];
      } catch (error) {
        throw new Error(`Error updating payment status: ${error.message}`);
      }
    },

    processPayment: async (_, { input }) => {
      try {
        // Verify order exists
        const order = await fetchOrder(input.order_id);
        if (!order) {
          throw new Error('Order not found');
        }

        // Verify amount
        if (Math.abs(input.amount - parseFloat(order.total_amount)) > 0.01) {
          throw new Error('Payment amount does not match order total');
        }

        // Simulate payment processing (in real scenario, this would integrate with payment gateway)
        // For now, we'll automatically set it as successful
        const [result] = await pool.query(
          'INSERT INTO payments (order_id, amount, payment_status) VALUES (?, ?, ?)',
          [input.order_id, input.amount, 'Berhasil']
        );

        const paymentId = result.insertId;

        // Send order to ShipXpress after successful payment
        await sendOrderToShipXpress(input.order_id);

        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE payment_id = ?',
          [paymentId]
        );

        return rows[0];
      } catch (error) {
        throw new Error(`Error processing payment: ${error.message}`);
      }
    }
  },

  Payment: {
    order: async (parent) => {
      return await fetchOrder(parent.order_id);
    }
  }
};

module.exports = resolvers;

