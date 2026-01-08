import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    customers: [Customer!]!
    customer(id: ID!): Customer
  }

  extend type Mutation {
    createCustomer(
      name: String!
      email: String!
      phone: String!
      address: String!
      C_type: String!
    ): Customer!
    updateCustomer(
      id: ID!
      name: String
      email: String
      phone: String
      address: String
      C_type: String
    ): Customer!
    deleteCustomer(id: ID!): Boolean!
  }

  type Customer @key(fields: "customer_id") {
    customer_id: ID!
    name: String!
    email: String!
    phone: String!
    address: String!
    C_type: String!
    created_at: String!
  }
`;

