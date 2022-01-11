import React, { ReactElement } from 'react';
import { makeOriginUiTheme, ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';

const originTheme = makeOriginUiTheme({ themeMode: ThemeModeEnum.Dark });

export default (children: ReactElement) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={originTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};
