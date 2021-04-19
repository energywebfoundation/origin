import React from 'react';
import ReactDOM from 'react-dom';

import App from './app/app';
import { OriginThemeProvider } from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
