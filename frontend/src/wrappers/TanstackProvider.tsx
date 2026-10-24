import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react';

// 1. Initialize the global TanStack Query Client instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        refetchOnWindowFocus: false, // Prevents aggressive refetching when switching browser tabs
        retry: 1,                    // Retries failing API calls once before showing an error state
        },
    },
})

interface TanstackProviderProps {
    children: ReactNode;
}

export const TanstackProvider = ({children} : TanstackProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}