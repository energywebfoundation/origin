import React from 'react';
import ReactDOM from 'react-dom';

import App from './app/app';
import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
