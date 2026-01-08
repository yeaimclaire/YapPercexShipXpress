import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    shipments: [Shipment!]!
    shipment(id: ID!): Shipment
    shipmentsByCustomer(customer_id: ID!): [Shipment!]!
    shipmentsByStatus(status: String!): [Shipment!]!
    shipmentsByVehicle(vehicle_id: ID!): [Shipment!]!
  }

  extend type Mutation {
    createShipment(
      customer_id: ID!
      origin_address: String!
      destination_address: String!
      S_type: String!
      weight: Float!
      status: String!
      vehicle_id: ID
    ): Shipment!
    # Fix: Menambahkan customer_id agar sesuai dengan request frontend
    updateShipment(
      id: ID!
      customer_id: ID
      origin_address: String
      destination_address: String
      S_type: String
      weight: Float
      status: String
      vehicle_id: ID
    ): Shipment!
    deleteShipment(id: ID!): Boolean!
  }

  type Shipment @key(fields: "shipment_id") {
    shipment_id: ID!
    customer_id: ID!
    customer: Customer
    origin_address: String!
    destination_address: String!
    S_type: String!
    weight: Float!
    status: String!
    vehicle_id: ID
    vehicle: Vehicle
    created_at: String!
  }

  extend type Customer @key(fields: "customer_id") {
    customer_id: ID! @external
  }

  extend type Vehicle @key(fields: "vehicle_id") {
    vehicle_id: ID! @external
  }
`;