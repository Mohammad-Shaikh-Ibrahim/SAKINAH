import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (cacheTime was renamed to gcTime in TanStack Query v5)
            refetchOnWindowFocus: false, // Prevent aggressive refetching
            retry: 1,
        },
        mutations: {
            // Global mutation error handling can go here or in a custom hook
            retry: 0,
        },
    },
});
