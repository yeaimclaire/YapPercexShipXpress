import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { orderClient, paymentClient } from '../lib/apollo-client';
import Layout from '../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      order_id
      total_amount
      status
      items {
        order_item_id
        product_id
        quantity
        price
      }
    }
  }
`;

const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($input: PaymentInput!) {
    processPayment(input: $input) {
      payment_id
      payment_status
      order {
        order_id
        status
      }
    }
  }
`;

export default function Checkout() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [createOrder] = useMutation(CREATE_ORDER, {
    client: orderClient,
  });

  const [processPayment] = useMutation(PROCESS_PAYMENT, {
    client: paymentClient,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResult = await createOrder({
        variables: {
          input: {
            user_id: parseInt(user.user_id),
            items: items.map((item) => ({
              product_id: parseInt(item.product_id),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      const order = orderResult.data.createOrder;

      // Process payment
      const paymentResult = await processPayment({
        variables: {
          input: {
            order_id: parseInt(order.order_id),
            amount: order.total_amount,
          },
        },
      });

      if (paymentResult.data.processPayment.payment_status === 'Berhasil') {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/${order.order_id}`);
      } else {
        toast.error('Payment failed');
      }
    } catch (error) {
      toast.error(error.message || 'Checkout failed');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please login to checkout</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
            >
              Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    value={user?.address || 'Address not set'}
                    disabled
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 mb-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <img
                    src="/qr-dummy.svg"
                    alt="QR payment code"
                    className="h-44 w-44"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Scan this QR code to pay
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confirm the payment after you complete the transfer.
                    </p>
                  </div>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  I have completed the payment
                </label>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading || !paymentConfirmed}
                className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Payment & Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
