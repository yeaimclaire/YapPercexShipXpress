import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-primary-50/60">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-primary-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-700">
                  YapPerce
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="border-transparent text-gray-600 hover:border-primary-300 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Products
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/orders"
                    className="border-transparent text-gray-600 hover:border-primary-300 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    My Orders
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative inline-flex items-center px-3 py-2 border border-primary-100 text-sm leading-4 font-medium rounded-full text-gray-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 rounded-full bg-primary-50 px-3 py-1">
                    <UserIcon className="h-5 w-5 text-primary-500" />
                    <span className="text-sm text-gray-700">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-primary-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-primary-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
