import Link from 'next/link';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock > 0) {
      addItem(product);
      toast.success('Product added to cart!');
    } else {
      toast.error('Product out of stock');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/products/${product.product_id}`}>
      <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.category && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                {product.category.category_name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                product.stock > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
