import React from 'react';
import { MemoryRouter } from 'react-router';
import { makeOriginUiConfig } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@material-ui/core/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

const uiConfiguration = makeOriginUiConfig();
export const OriginThemeProvider = ({ children }) => {
  const configuration = makeOriginUiConfig();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={configuration.materialTheme}>
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
