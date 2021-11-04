import {
  makeOriginUiConfig,
  useThemeModeStore,
} from '@energyweb/origin-ui-theme';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';
import React, { FC } from 'react';

export const OriginThemeProvider: FC = ({ children }) => {
  const themeMode = useThemeModeStore();
  const configuration = makeOriginUiConfig(themeMode);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={configuration.materialTheme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
