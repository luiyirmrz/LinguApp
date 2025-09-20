// tRPC configuration with environment-based setup
import { config } from '@/config/environment';

// Import tRPC dependencies
import { createTRPCReact } from '@trpc/react-query';
import { httpLink } from '@trpc/client';
import type { AppRouter } from '@/backend/trpc/app-router';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  // Use environment configuration
  if (config.apiBaseUrl) {
    return config.apiBaseUrl;
  }

  // Fallback for development
  if (__DEV__) {
    return 'http://localhost:3000';
  }

  throw new Error(
    'No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL',
  );
};

// Create tRPC client with error handling
const createTRPCClient = () => {
  try {
    const baseUrl = getBaseUrl();
    console.log('Initializing tRPC client with base URL:', baseUrl);
    
    return trpc.createClient({
      links: [
        httpLink({
          url: `${baseUrl}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });
  } catch (error) {
    console.warn('Failed to create tRPC client, using mock:', error);
    
    // Return mock client for development
    return {
      links: [],
      queryClient: null,
    };
  }
};

// Export tRPC client
export const trpcClient = createTRPCClient();
