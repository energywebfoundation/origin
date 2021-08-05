import React from 'react';
import ReactDOM from 'react-dom';

import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';
import { ErrorFallback } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import { getLibrary } from '@energyweb/origin-ui-blockchain';
import { OriginQueryClientProvider } from './components';
import { AppContainer } from './AppContainer';
import { Web3ReactProvider } from '@web3-react/core';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <Web3ReactProvider getLibrary={getLibrary}>
            <OriginQueryClientProvider>
              <AppContainer />
            </OriginQueryClientProvider>
          </Web3ReactProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
