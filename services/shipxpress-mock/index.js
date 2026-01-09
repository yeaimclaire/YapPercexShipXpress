const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 4014;

// In-memory storage for shipments (in real scenario, this would be a database)
const shipments = new Map();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers(shipments),
  introspection: true,
  playground: true,
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(PORT, () => {
    console.log(`ShipXpress Mock Service running on http://localhost:${PORT}/graphql`);
    console.log('This is a mock service for testing integration with YapPerce Marketplace');
  });
}

startServer();

module.exports = app;

