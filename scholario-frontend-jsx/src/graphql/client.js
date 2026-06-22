import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { keycloak } from '../features/auth/AuthContext';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = keycloak.token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  let is401 = false;
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (
        err.extensions?.code === 'UNAUTHENTICATED' || 
        err.message.includes('401') || 
        err.message.toLowerCase().includes('unauthorized')
      ) {
        is401 = true;
        break;
      }
    }
  }
  if (networkError && networkError.statusCode === 401) {
    is401 = true;
  }

  if (is401) {
    window.dispatchEvent(new CustomEvent('graphql-auth-error', { detail: { status: 401 } }));
  }
});

export const client = new ApolloClient({
  link: authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache(),
});
