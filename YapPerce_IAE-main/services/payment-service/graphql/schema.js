const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Payment {
    payment_id: ID!
    order_id: Int!
    payment_date: String!
    amount: Float!
    payment_status: String!
    order: Order
  }

  type Order {
    order_id: ID!
    user_id: Int!
    total_amount: Float!
    status: String!
  }

  input PaymentInput {
    order_id: Int!
    amount: Float!
  }

  type Query {
    payments: [Payment!]!
    payment(id: ID!): Payment
    paymentsByOrder(orderId: ID!): [Payment!]!
  }

  type Mutation {
    createPayment(input: PaymentInput!): Payment!
    updatePaymentStatus(id: ID!, status: String!): Payment!
    processPayment(input: PaymentInput!): Payment!
  }
`;

module.exports = typeDefs;

