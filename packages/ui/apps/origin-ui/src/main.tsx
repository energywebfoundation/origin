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

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <OriginQueryClientProvider>
            <AuthProvider initialState={localStorage.getItem('authToken')}>
              <AccountProvider>
                <SettingsProvider>
                  <AppContainer />
                </SettingsProvider>
              </AccountProvider>
            </AuthProvider>
          </OriginQueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
