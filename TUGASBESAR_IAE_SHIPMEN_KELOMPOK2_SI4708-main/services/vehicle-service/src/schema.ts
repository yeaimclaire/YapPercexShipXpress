import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    vehicles: [Vehicle!]!
    vehicle(id: ID!): Vehicle
    vehiclesByStatus(status: String!): [Vehicle!]!
  }

  extend type Mutation {
    createVehicle(
      V_type: String!
      license_plate: String!
      capacity: Float!
      status: String!
    ): Vehicle!
    updateVehicle(
      id: ID!
      V_type: String
      license_plate: String
      capacity: Float
      status: String
    ): Vehicle!
    deleteVehicle(id: ID!): Boolean!
  }

  type Vehicle @key(fields: "vehicle_id") {
    vehicle_id: ID!
    V_type: String!
    license_plate: String!
    capacity: Float!
    status: String!
    created_at: String!
  }
`;

