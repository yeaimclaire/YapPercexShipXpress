import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import useCartStore from '../store/cartStore';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Cart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.product_id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      <MinusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (item.stock > item.quantity) {
                          updateQuantity(item.product_id, item.quantity + 1);
                        } else {
                          toast.error('Not enough stock available');
                        }
                      }}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  <p className="text-lg font-semibold text-gray-900 w-32 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => {
                      removeItem(item.product_id);
                      toast.success('Item removed from cart');
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-primary-50/60 border-t border-primary-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(getTotal())}
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 border border-primary-200 text-gray-700 rounded-md font-medium hover:bg-primary-50"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
