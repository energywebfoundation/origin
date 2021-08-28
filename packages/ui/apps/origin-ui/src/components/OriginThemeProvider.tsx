import { makeOriginUiConfig } from '@energyweb/origin-ui-theme';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import { ThemeProvider } from '@material-ui/core/styles';
import React, { FC } from 'react';

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
