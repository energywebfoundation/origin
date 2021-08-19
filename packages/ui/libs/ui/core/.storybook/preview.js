import { MemoryRouter } from 'react-router';
import {
  OriginThemeProvider,
  makeOriginUiConfig,
} from '@energyweb/origin-ui-theme';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

const uiConfiguration = makeOriginUiConfig();

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
