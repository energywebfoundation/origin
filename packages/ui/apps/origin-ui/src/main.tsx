import React from 'react';
import ReactDOM from 'react-dom';

import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';
import { ErrorFallback } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import {
  AuthProvider,
  OriginQueryClientProvider,
} from '@energyweb/origin-ui-react-query-providers';
import {
  AccountProvider,
  SettingsProvider,
} from '@energyweb/origin-ui-user-view';
import AppContainer from './app-container/AppContainer';
import { BlockchainProvider } from '@energyweb/origin-ui-blockchain';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <OriginQueryClientProvider>
            <AuthProvider
              initialState={localStorage.getItem('AUTHENTICATION_TOKEN')}
            >
              <AccountProvider>
                <BlockchainProvider>
                  <SettingsProvider>
                    <AppContainer />
                  </SettingsProvider>
                </BlockchainProvider>
              </AccountProvider>
            </AuthProvider>
          </OriginQueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
