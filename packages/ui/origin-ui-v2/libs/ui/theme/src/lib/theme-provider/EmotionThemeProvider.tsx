import React, { FC } from 'react';
import { ThemeProvider } from '@emotion/react';
import makeOriginUiConfig from '../utils/makeOriginUiConfig';

export const EmotionThemeProvider: FC = ({ children }) => {
  const configuration = makeOriginUiConfig();
  return (
    <ThemeProvider theme={configuration.materialTheme}>
      {children}
    </ThemeProvider>
  );
};
