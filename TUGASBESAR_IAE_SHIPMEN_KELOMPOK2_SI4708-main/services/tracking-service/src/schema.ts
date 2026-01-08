import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    trackingUpdates: [TrackingUpdate!]!
    trackingUpdate(id: ID!): TrackingUpdate
    trackingUpdatesByShipment(shipment_id: ID!): [TrackingUpdate!]!
    trackingUpdatesByStatus(status: String!): [TrackingUpdate!]!
  }

  extend type Mutation {
    createTrackingUpdate(
      shipment_id: ID!
      location: String!
      status: String!
      recipient_name: String
      recipient_phone: String
      recipient_address: String
      item_name: String
      barcode: String
    ): TrackingUpdate!
    updateTrackingUpdate(
      id: ID!
      location: String
      status: String
      recipient_name: String
      recipient_phone: String
      recipient_address: String
      item_name: String
      barcode: String
    ): TrackingUpdate!
    deleteTrackingUpdate(id: ID!): Boolean!
  }

  type TrackingUpdate @key(fields: "tracking_id") {
    tracking_id: ID!
    shipment_id: ID!
    shipment: Shipment
    location: String!
    status: String!
    recipient_name: String
    recipient_phone: String
    recipient_address: String
    item_name: String
    barcode: String
    updated_at: String!
  }

  extend type Shipment @key(fields: "shipment_id") {
    shipment_id: ID! @external
  }
`;

