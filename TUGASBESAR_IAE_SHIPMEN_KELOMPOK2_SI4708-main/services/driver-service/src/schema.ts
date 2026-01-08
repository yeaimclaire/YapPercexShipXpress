import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    drivers: [Driver!]!
    driver(id: ID!): Driver
    driversByVehicle(vehicle_id: ID!): [Driver!]!
  }

  extend type Mutation {
    createDriver(
      name_driver: String!
      phone_driver: String!
      license_driver: String!
      vehicle_id: ID
      profile_photo: String
    ): Driver!
    updateDriver(
      id: ID!
      name_driver: String
      phone_driver: String
      license_driver: String
      vehicle_id: ID
      profile_photo: String
    ): Driver!
    deleteDriver(id: ID!): Boolean!
  }

  type Driver @key(fields: "driver_id") {
    driver_id: ID!
    name_driver: String!
    phone_driver: String!
    license_driver: String!
    vehicle_id: ID
    vehicle: Vehicle
    profile_photo: String
    created_at: String!
  }

  extend type Vehicle @key(fields: "vehicle_id") {
    vehicle_id: ID! @external
  }
`;

