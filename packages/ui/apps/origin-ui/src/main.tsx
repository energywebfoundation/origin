import React from 'react';
import ReactDOM from 'react-dom';

import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';
import { ErrorFallback } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import { OriginQueryClientProvider } from '@energyweb/origin-ui-react-query-providers';
import { AppContainer } from './AppContainer';
import { BlockchainProvider } from '@energyweb/origin-ui-blockchain';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <OriginQueryClientProvider>
            <BlockchainProvider>
              <AppContainer />
            </BlockchainProvider>
          </OriginQueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
