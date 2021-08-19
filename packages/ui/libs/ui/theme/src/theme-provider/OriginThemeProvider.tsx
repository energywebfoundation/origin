import React, { FC } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import { makeOriginUiConfig } from '../utils/makeOriginUiConfig';

export const OriginThemeProvider: FC = ({ children }) => {
  const configuration = makeOriginUiConfig();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={configuration.materialTheme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
