import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

// Create HTTP links for each service
const userServiceLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4010/graphql',
});

const productServiceLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:4011/graphql',
});

const orderServiceLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:4012/graphql',
});

const paymentServiceLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:4013/graphql',
});

// Auth link to add token to headers
const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create clients for each service
export const userClient = new ApolloClient({
  link: from([authLink, userServiceLink]),
  cache: new InMemoryCache(),
});

export const productClient = new ApolloClient({
  link: from([authLink, productServiceLink]),
  cache: new InMemoryCache(),
});

export const orderClient = new ApolloClient({
  link: from([authLink, orderServiceLink]),
  cache: new InMemoryCache(),
});

export const paymentClient = new ApolloClient({
  link: from([authLink, paymentServiceLink]),
  cache: new InMemoryCache(),
});

// Default client (uses product service as default)
export const apolloClient = productClient;

