const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 4012;

// Middleware for parsing JSON
app.use(express.json());

// Database connection will be handled by pool automatically
console.log('Order Service starting...');

// Webhook endpoint for ShipXpress to send shipment status updates
app.post('/webhook/shipment-status', async (req, res) => {
  try {
    const { shipmentId, orderId, status } = req.body;

    if (!shipmentId || !orderId || !status) {
      return res.status(400).json({ error: 'Missing required fields: shipmentId, orderId, status' });
    }

    const { pool } = require('./config/database');

    // Map ShipXpress status to our order status
    let orderStatus = 'Dalam Pengiriman';
    if (status === 'Delivered' || status === 'Selesai') {
      orderStatus = 'Selesai';
    }

    // Update order with shipment status
    await pool.query(
      'UPDATE orders SET shipment_status = ?, status = ?, shipment_id = ? WHERE order_id = ?',
      [status, orderStatus, shipmentId, orderId]
    );

    console.log(`Shipment status updated for order ${orderId}: ${status}`);

    res.json({ success: true, message: 'Shipment status updated' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(PORT, () => {
    console.log(`Order Service running on http://localhost:${PORT}/graphql`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/shipment-status`);
  });
}

startServer();

module.exports = app;

