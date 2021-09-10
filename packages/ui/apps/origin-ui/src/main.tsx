import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { getLibrary } from '@energyweb/origin-ui-blockchain';
import { Web3ReactProvider } from '@web3-react/core';
import {
  CustomErrorFallback,
  OriginQueryClientProvider,
  OriginThemeProvider,
} from './components';
import { AppContainer } from './components/AppContainer';
import { ThemeModeProvider } from '@energyweb/origin-ui-theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeModeProvider>
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
    </ThemeModeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
