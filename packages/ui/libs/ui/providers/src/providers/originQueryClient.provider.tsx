import { QueryClient, QueryClientProvider } from 'react-query';
import React, { ReactElement } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
export const OriginQueryClientProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
};
