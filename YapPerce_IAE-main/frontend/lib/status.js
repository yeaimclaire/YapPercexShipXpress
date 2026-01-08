export const CANONICAL_STATUSES = {
  order_placed: { label: 'Order Placed', tone: 'amber' },
  preparing: { label: 'Preparing Shipment', tone: 'rose' },
  in_transit: { label: 'In Transit', tone: 'sky' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'indigo' },
  delivered: { label: 'Delivered', tone: 'emerald' },
  payment_pending: { label: 'Payment Pending', tone: 'amber' },
  paid: { label: 'Paid', tone: 'emerald' },
  canceled: { label: 'Canceled', tone: 'slate' },
  unknown: { label: 'Status Unknown', tone: 'slate' },
};

export const BACKEND_STATUS_TO_CANONICAL = {
  Dipesan: 'order_placed',
  'Dalam Pengiriman': 'out_for_delivery',
  Selesai: 'delivered',
  Processing: 'preparing',
  shipment_processing: 'preparing',
  Shipped: 'in_transit',
  'In Transit': 'in_transit',
  on_delivery: 'out_for_delivery',
  Delivered: 'delivered',
  Tertunda: 'payment_pending',
  Berhasil: 'paid',
  Failed: 'canceled',
  Canceled: 'canceled',
};

export function resolveCanonicalStatus(rawStatus) {
  if (!rawStatus) return CANONICAL_STATUSES.unknown;
  const normalized = BACKEND_STATUS_TO_CANONICAL[rawStatus] || 'unknown';
  return CANONICAL_STATUSES[normalized] || CANONICAL_STATUSES.unknown;
}

export function resolveCanonicalStatusKey(rawStatus) {
  if (!rawStatus) return 'unknown';
  return BACKEND_STATUS_TO_CANONICAL[rawStatus] || 'unknown';
}

export function resolveOrderStatus(order) {
  if (!order) return CANONICAL_STATUSES.unknown;
  const statusSource = order.shipment_status || order.status;
  return resolveCanonicalStatus(statusSource);
}
