const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Shipment {
    shipmentId: ID!
    orderId: ID!
    userId: Int!
    status: String!
    trackingNumber: String!
    items: [ShipmentItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type ShipmentItem {
    productId: Int!
    quantity: Int!
    price: Float!
  }

  input ShipmentItemInput {
    productId: Int!
    quantity: Int!
    price: Float!
  }

  type CreateShipmentResponse {
    success: Boolean!
    shipmentId: ID
    message: String
  }

  type UpdateShipmentStatusResponse {
    success: Boolean!
    message: String
  }

  type Query {
    shipment(shipmentId: ID!): Shipment
    shipments: [Shipment!]!
    shipmentsByOrder(orderId: ID!): [Shipment!]!
  }

  type Mutation {
    createShipment(orderId: ID!, userId: Int!, items: [ShipmentItemInput!]!): CreateShipmentResponse!
    updateShipmentStatus(shipmentId: ID!, status: String!): UpdateShipmentStatusResponse!
  }
`;

module.exports = typeDefs;

