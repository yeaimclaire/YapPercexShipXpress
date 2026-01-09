/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4010/graphql',
    NEXT_PUBLIC_PRODUCT_SERVICE_URL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:4011/graphql',
    NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:4012/graphql',
    NEXT_PUBLIC_PAYMENT_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:4013/graphql',
  }
}

module.exports = nextConfig

