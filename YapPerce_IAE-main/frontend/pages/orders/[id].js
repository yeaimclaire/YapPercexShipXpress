import { useQuery } from '@apollo/client';
import { orderClient } from '../../lib/apollo-client';
import Layout from '../../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';
import { resolveCanonicalStatusKey } from '../../lib/status';

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      order_id
      user_id
      order_date
      total_amount
      status
      shipment_status
      shipment_id
      user {
        name
        email
      }
      items {
        order_item_id
        product_id
        quantity
        price
        product {
          product_id
          name
          price
        }
      }
    }
  }
`;

const TRACKING_STEPS = [
  { key: 'order_placed', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing Shipment' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_ORDER, {
    client: orderClient,
    variables: { id: String(id) },
    skip: !id,
    fetchPolicy: 'no-cache',
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to view your order details.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
            >
              Log In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!id) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Order ID is missing.</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Order detail error:', error);
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Unable to load order details.</p>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data?.order) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Order not found.</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const order = data.order;
  const statusKey = resolveCanonicalStatusKey(order.shipment_status || order.status);
  const activeIndex = Math.max(
    0,
    TRACKING_STEPS.findIndex((step) => step.key === statusKey)
  );

  if (isAuthenticated && user && order.user_id !== parseInt(user.user_id, 10)) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">You do not have access to this order.</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/orders')}
          className="mb-6 text-primary-600 hover:text-primary-700"
        >
          Back to Orders
        </button>

        <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold">
                  Order #{order.order_id}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">
                  {formatDate(order.order_date)}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {order.items.length} items - {formatPrice(order.total_amount)}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <StatusBadge status={order.shipment_status || order.status} />
                <p className="text-xs text-gray-500">Tracking ID: {order.shipment_id || 'Not available yet'}</p>
              </div>
            </div>

            {!order.shipment_id && (
              <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm text-gray-700">
                Shipment tracking is not available yet. Check back after the order is dispatched.
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Timeline</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {TRACKING_STEPS.map((step, index) => {
                  const isActive = index <= activeIndex;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                        isActive
                          ? 'border-primary-300 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        ></span>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-primary-100 bg-white p-4">
                <p className="text-xs uppercase text-gray-500">Customer</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {user?.name || order.user?.name || 'Customer'}
                </p>
                <p className="text-sm text-gray-600">{user?.email || order.user?.email || '-'}</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4">
                <p className="text-xs uppercase text-gray-500">Shipping Address</p>
                <p className="text-sm text-gray-700 mt-2">
                  {user?.address || 'Address not set'}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-primary-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex flex-col gap-2 rounded-xl border border-primary-100 bg-primary-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.name || `Product ${item.product_id}`}
                      </p>
                      <p className="text-xs text-gray-600">Qty {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-lg font-semibold text-gray-900">Order Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
