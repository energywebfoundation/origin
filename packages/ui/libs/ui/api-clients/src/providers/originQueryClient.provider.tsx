import { QueryClient, QueryClientProvider } from 'react-query';
import React, { ReactElement } from 'react';

const queryClient = new QueryClient();

export const OriginQueryClientProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  return <QueryClientProvider children={children} client={queryClient} />;
};
