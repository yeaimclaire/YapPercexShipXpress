import express from 'express';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';

const app = express();
const PORT = process.env.PORT || 4000;

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      {
        name: 'auth',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:4006/graphql',
      },
      {
        name: 'customer',
        url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:4001/graphql',
      },
      {
        name: 'vehicle',
        url: process.env.VEHICLE_SERVICE_URL || 'http://localhost:4002/graphql',
      },
      {
        name: 'driver',
        url: process.env.DRIVER_SERVICE_URL || 'http://localhost:4003/graphql',
      },
      {
        name: 'shipment',
        url: process.env.SHIPMENT_SERVICE_URL || 'http://localhost:4004/graphql',
      },
      {
        name: 'tracking',
        url: process.env.TRACKING_SERVICE_URL || 'http://localhost:4005/graphql',
      },
    ],
  }),
});

const server = new ApolloServer({
  gateway,
  introspection: true,
});

async function startServer() {
  await server.start();
  
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server)
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'gateway' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 ShipXpress Gateway running on http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((error) => {
  console.error('Error starting gateway:', error);
  process.exit(1);
});

