import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false, // Prevent aggressive refetching
            retry: 1,
        },
        mutations: {
            // Global mutation error handling can go here or in a custom hook
            retry: 0,
        },
    },
});
