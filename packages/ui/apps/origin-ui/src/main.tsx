import React from 'react';
import ReactDOM from 'react-dom';

import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { getLibrary } from '@energyweb/origin-ui-blockchain';
import { Web3ReactProvider } from '@web3-react/core';
import { CustomErrorFallback, OriginQueryClientProvider } from './components';
import { AppContainer } from './AppContainer';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <ErrorBoundary FallbackComponent={CustomErrorFallback}>
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
