const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    user_id: ID!
    name: String!
    email: String!
    phone: String
    address: String
    password: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    phone: String
    address: String
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    phone: String
    address: String
    password: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    login(email: String!, password: String!): AuthPayload
  }

  type Mutation {
    registerUser(input: RegisterInput!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;

