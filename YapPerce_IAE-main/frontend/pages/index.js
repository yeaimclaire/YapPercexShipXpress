import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { productClient } from '../lib/apollo-client';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { gql } from '@apollo/client';
import toast from 'react-hot-toast';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
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
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      category_id
      category_name
    }
  }
`;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(
    GET_PRODUCTS,
    { client: productClient }
  );

  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    client: productClient,
  });

  if (productsError) {
    toast.error('Failed to load products');
  }

  let products = productsData?.products || [];

  // Filter by category
  if (selectedCategory) {
    products = products.filter(
      (p) => p.category?.category_id === selectedCategory
    );
  }

  // Filter by search term
  if (searchTerm) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white/80 border border-primary-100 rounded-2xl p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to YapPerce Marketplace
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Soft, curated picks with fast shipping updates from ShipXpress.
          </p>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-primary-100 rounded-lg bg-white/90 focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          {categoriesData?.categories && categoriesData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                All
              </button>
              {categoriesData.categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => setSelectedCategory(category.category_id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category.category_id
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {productsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
