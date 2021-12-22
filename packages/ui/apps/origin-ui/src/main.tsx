import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeModeProvider } from '@energyweb/origin-ui-theme';
import { Web3ContextProvider } from '@energyweb/origin-ui-web3';
import {
  CustomErrorFallback,
  OriginQueryClientProvider,
  OriginThemeProvider,
} from './components';

import { AppContainer } from './components/AppContainer';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={CustomErrorFallback}>
      <ThemeModeProvider>
        <OriginThemeProvider>
          <BrowserRouter>
            <Web3ContextProvider>
              <OriginQueryClientProvider>
                <AppContainer />
              </OriginQueryClientProvider>
            </Web3ContextProvider>
          </BrowserRouter>
        </OriginThemeProvider>
      </ThemeModeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
