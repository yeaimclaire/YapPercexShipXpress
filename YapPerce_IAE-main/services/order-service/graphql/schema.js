const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Order {
    order_id: ID!
    user_id: Int!
    order_date: String!
    total_amount: Float!
    status: String!
    shipment_status: String
    shipment_id: String
    user: User
    items: [OrderItem!]!
  }

  type OrderItem {
    order_item_id: ID!
    order_id: Int!
    product_id: Int!
    quantity: Int!
    price: Float!
    product: Product
  }

  type User {
    user_id: ID!
    name: String!
    email: String!
  }

  type Product {
    product_id: ID!
    name: String!
    price: Float!
  }

  input OrderItemInput {
    product_id: Int!
    quantity: Int!
    price: Float!
  }

  input OrderInput {
    user_id: Int!
    items: [OrderItemInput!]!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
    ordersByUser(userId: ID!): [Order!]!
  }

  type Mutation {
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    updateShipmentStatus(id: ID!, shipmentStatus: String!): Order!
    sendOrderToShipXpress(orderId: ID!): Boolean!
  }
`;

module.exports = typeDefs;

