import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { userClient } from '../lib/apollo-client';
import Layout from '../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

const REGISTER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      token
      user {
        user_id
        name
        email
        phone
        address
      }
    }
  }
`;

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const [register, { loading }] = useMutation(REGISTER, {
    client: userClient,
    onCompleted: (data) => {
      if (data.registerUser) {
        setAuth(data.registerUser.user, data.registerUser.token);
        toast.success('Registration successful!');
        router.push('/');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register({
      variables: {
        input: formData,
      },
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 border border-primary-100 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Register
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="081234567890"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="Your address"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
