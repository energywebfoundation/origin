import React from 'react';
import ReactDOM from 'react-dom';

import App from './app/app';
import { ThemeProvider } from '@energyweb/origin-ui-theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
