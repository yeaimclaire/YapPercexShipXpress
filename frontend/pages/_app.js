import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { apolloClient } from '../lib/apollo-client';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ApolloProvider>
  );
}

export default MyApp;

