import { useQuery } from '@apollo/client';
import { productClient } from '../../lib/apollo-client';
import Layout from '../../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      product_id
      name
      description
      price
      stock
      category {
        category_id
        category_name
      }
      seller {
        user_id
        name
        email
      }
    }
  }
`;

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const addItem = useCartStore((state) => state.addItem);

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    client: productClient,
    variables: { id },
    skip: !id,
  });

  const handleAddToCart = () => {
    if (data?.product) {
      if (data.product.stock > 0) {
        addItem(data.product);
        toast.success('Product added to cart!');
      } else {
        toast.error('Product out of stock');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data?.product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Product not found</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const product = data.product;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-primary-600 hover:text-primary-700"
        >
          ← Back
        </button>

        <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-primary-50/70 p-8 flex items-center justify-center">
              <div className="text-6xl text-gray-400">📦</div>
            </div>
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {product.category && (
                <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm mb-4">
                  {product.category.category_name}
                </span>
              )}

              <div className="mb-6">
                <p className="text-3xl font-bold text-primary-600 mb-2">
                  {formatPrice(product.price)}
                </p>
                <p
                  className={`text-sm ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} items in stock`
                    : 'Out of stock'}
                </p>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.seller && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Seller
                  </h2>
                  <p className="text-gray-600">{product.seller.name}</p>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-md text-lg font-medium ${
                  product.stock > 0
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
