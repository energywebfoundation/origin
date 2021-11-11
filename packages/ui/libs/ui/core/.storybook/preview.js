import React from 'react';
import { MemoryRouter } from 'react-router';
import { makeOriginUiConfig, ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

const uiConfiguration = makeOriginUiConfig(ThemeModeEnum.Dark);

export const OriginThemeProvider = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={uiConfiguration.materialTheme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

const themeDecorator = (Story, context) => (
  <EmotionThemeProvider theme={uiConfiguration.materialTheme}>
    <OriginThemeProvider>
      <Story {...context} />
    </OriginThemeProvider>
  </EmotionThemeProvider>
);

const routerDecorator = (Story) => (
  <MemoryRouter initialEntries={['/']}>
    <Story />
  </MemoryRouter>
);

export const decorators = [themeDecorator, routerDecorator];

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
