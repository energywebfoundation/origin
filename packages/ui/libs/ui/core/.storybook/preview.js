import React from 'react';
import { MemoryRouter } from 'react-router';
import { makeOriginUiTheme, ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

const originTheme = makeOriginUiTheme({ themeMode: ThemeModeEnum.Dark });

export const OriginThemeProvider = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={originTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

export const decorators = [
  (Story) => (
    <EmotionThemeProvider theme={originTheme}>
      <OriginThemeProvider>{Story()}</OriginThemeProvider>
    </EmotionThemeProvider>
  ),
  (Story) => <MemoryRouter initialEntries={['/']}>{Story()}</MemoryRouter>,
];

export const parameters = {
  backgrounds: {
    default: 'dark',
    values: [
      {
        name: 'dark',
        value: '#333333',
      },
      {
        name: 'light',
        value: '#ffffff',
      },
    ],
  },
};
