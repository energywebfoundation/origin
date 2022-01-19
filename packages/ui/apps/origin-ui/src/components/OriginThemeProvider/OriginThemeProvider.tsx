import {
  makeOriginUiTheme,
  useThemeModeStore,
} from '@energyweb/origin-ui-theme';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';
import React, { FC } from 'react';

export const OriginThemeProvider: FC = ({ children }) => {
  const themeMode = useThemeModeStore();
  const originTheme = makeOriginUiTheme({ themeMode });
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={originTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};
