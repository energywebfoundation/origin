import React from 'react';
import ReactDOM from 'react-dom';

import App from './app/app';
import {
  OriginThemeProvider,
  EmotionThemeProvider,
} from '@energyweb/origin-ui-theme';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <EmotionThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </EmotionThemeProvider>
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
