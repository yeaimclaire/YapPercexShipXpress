const axios = require('axios');

const ORDER_SERVICE_WEBHOOK_URL = process.env.ORDER_SERVICE_WEBHOOK_URL || 'http://order-service:4012/webhook/shipment-status';

// Helper function to send webhook to Order Service
async function sendWebhook(shipmentId, orderId, status) {
  try {
    await axios.post(ORDER_SERVICE_WEBHOOK_URL, {
      shipmentId,
      orderId,
      status
    });
    console.log(`Webhook sent: Order ${orderId} - Status: ${status}`);
  } catch (error) {
    console.error(`Failed to send webhook for order ${orderId}:`, error.message);
  }
}

module.exports = (shipments) => {
  // Generate tracking number
  function generateTrackingNumber() {
    return 'SHP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  return {
    Query: {
      shipment: (_, { shipmentId }) => {
        const shipment = shipments.get(shipmentId);
        if (!shipment) {
          throw new Error('Shipment not found');
        }
        return shipment;
      },

      shipments: () => {
        return Array.from(shipments.values());
      },

      shipmentsByOrder: (_, { orderId }) => {
        return Array.from(shipments.values()).filter(s => s.orderId === orderId.toString());
      }
    },

    Mutation: {
      createShipment: (_, { orderId, userId, items }) => {
        try {
          const shipmentId = `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const trackingNumber = generateTrackingNumber();
          const now = new Date().toISOString();

          const shipment = {
            shipmentId,
            orderId: orderId.toString(),
            userId,
            status: 'Processing',
            trackingNumber,
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            })),
            createdAt: now,
            updatedAt: now
          };

          shipments.set(shipmentId, shipment);

          // Simulate status updates (in real scenario, this would be handled by actual logistics)
          setTimeout(async () => {
            if (shipments.has(shipmentId)) {
              const s = shipments.get(shipmentId);
              s.status = 'Shipped';
              s.updatedAt = new Date().toISOString();
              shipments.set(shipmentId, s);
              // Send webhook to Order Service
              await sendWebhook(shipmentId, orderId.toString(), 'Shipped');
            }
          }, 5000); // After 5 seconds, status becomes "Shipped"

          setTimeout(async () => {
            if (shipments.has(shipmentId)) {
              const s = shipments.get(shipmentId);
              s.status = 'In Transit';
              s.updatedAt = new Date().toISOString();
              shipments.set(shipmentId, s);
              // Send webhook to Order Service
              await sendWebhook(shipmentId, orderId.toString(), 'In Transit');
            }
          }, 10000); // After 10 seconds, status becomes "In Transit"

          setTimeout(async () => {
            if (shipments.has(shipmentId)) {
              const s = shipments.get(shipmentId);
              s.status = 'Delivered';
              s.updatedAt = new Date().toISOString();
              shipments.set(shipmentId, s);
              // Send webhook to Order Service
              await sendWebhook(shipmentId, orderId.toString(), 'Delivered');
            }
          }, 15000); // After 15 seconds, status becomes "Delivered"

          return {
            success: true,
            shipmentId,
            message: 'Shipment created successfully'
          };
        } catch (error) {
          return {
            success: false,
            shipmentId: null,
            message: error.message
          };
        }
      },

      updateShipmentStatus: async (_, { shipmentId, status }) => {
        try {
          const shipment = shipments.get(shipmentId);
          if (!shipment) {
            throw new Error('Shipment not found');
          }

          shipment.status = status;
          shipment.updatedAt = new Date().toISOString();
          shipments.set(shipmentId, shipment);

          // Send webhook to Order Service
          await sendWebhook(shipmentId, shipment.orderId, status);

          return {
            success: true,
            message: 'Shipment status updated successfully'
          };
        } catch (error) {
          return {
            success: false,
            message: error.message
          };
        }
      }
    }
  };
};

