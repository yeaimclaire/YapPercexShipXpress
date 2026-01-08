import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      full_name: String
      role: String
    ): AuthResponse!
    login(
      email: String!
      password: String!
    ): AuthResponse!
    updateUser(
      id: ID!
      username: String
      email: String
      full_name: String
      role: String
    ): User!
    changePassword(
      id: ID!
      oldPassword: String!
      newPassword: String!
    ): Boolean!
    deleteUser(id: ID!): Boolean!
  }

  type User @key(fields: "user_id") {
    user_id: ID!
    username: String!
    email: String!
    role: String!
    full_name: String
    created_at: String!
    updated_at: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }
`;

