import { useQuery } from '@apollo/client';
import { orderClient } from '../lib/apollo-client';
import Layout from '../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const GET_ORDERS_BY_USER = gql`
  query GetOrdersByUser($userId: ID!) {
    ordersByUser(userId: $userId) {
      order_id
      order_date
      total_amount
      status
      shipment_status
      shipment_id
      items {
        order_item_id
        product_id
        quantity
        price
        product {
          name
        }
      }
    }
  }
`;

export default function Orders() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const { data, loading, error } = useQuery(GET_ORDERS_BY_USER, {
    client: orderClient,
    variables: { userId: String(user?.user_id || '0') },
    skip: !isAuthenticated || !user,
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
            <p className="text-gray-600 mb-4">Please log in to view your orders.</p>
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

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Orders error:', error);
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Error loading orders: {error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const orders = data?.ordersByUser || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-600 font-semibold">
            Order Tracking
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Orders at a Glance
          </h1>
          <p className="text-sm text-gray-600">
            Track shipment progress and review your purchased items.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You do not have any orders yet.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white/90 border border-primary-100 rounded-2xl shadow-md overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold">
                        Order #{order.order_id}
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 mt-2">
                        {formatDate(order.order_date)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items.length} items - {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <StatusBadge status={order.shipment_status || order.status} />
                      <p className="text-xs text-gray-500">
                        Tracking ID: {order.shipment_id || 'Not available yet'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-primary-100 pt-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {order.items.map((item) => (
                        <div
                          key={item.order_item_id}
                          className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50/40 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.product?.name || `Product ${item.product_id}`}
                            </p>
                            <p className="text-xs text-gray-600">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-600">
                        Need shipment details? View the full timeline and address.
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <button
                          type="button"
                          disabled={!order.shipment_id}
                          onClick={() => {
                            if (!order.shipment_id) {
                              toast.error('Shipment details are not available yet.');
                              return;
                            }
                            router.push(`/orders/${order.order_id}`);
                          }}
                          className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
                            order.shipment_id
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          View Details
                        </button>
                        {!order.shipment_id && (
                          <p className="text-xs text-amber-600">
                            Shipment details will appear once dispatched.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
