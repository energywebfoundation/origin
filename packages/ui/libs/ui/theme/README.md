<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Theme

## Description

Material-UI theme configuration and helper functions for styling components used for building Origin marketplace user interface.

This package can also be used as a reference when building custom theme configuration.

Origin UI Theme is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-theme
```

```sh
yarn add @energyweb/origin-ui-theme
```

### Requirements

Before installing make sure you have `react` >= 17.0.2 installed.

### Usage

1. Using default theme configuration

```JSX
import React, { FC } from 'react';
import { makeOriginUiTheme, useThemeModeStore } from '@energyweb/origin-ui-theme';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';

export const OriginThemeProvider = ({ children }) => {
  // if using 2 themes
  const themeMode = useThemeModeStore();
  const originTheme = makeOriginUiTheme({ themeMode });
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={originTheme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
```

Then in your `index.j(t)sx` or `main.j(t)sx` :

```JSX
ReactDOM.render(
  <React.StrictMode>
    <OriginThemeProvider>
      <App />
    </OriginThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

1. Custom theme configuration
   `makeOriginUiTheme` accepts 2 argements:

- `themeMode`: ThemeModeEnum ('light' | 'dark')
- `colorsConfig`: OriginUiThemeVariables

```
{
  primaryColor: string;
  primaryColorDark: string;
  primaryColorDim: string;
  textColorDefault: string;
  inputAutofillColor: string;
  simpleTextColor: string;
  bodyBackgroundColor: string;
  mainBackgroundColor: string;
  fieldIconColor: string;
  fontFamilyPrimary: string;
  fontFamilySecondary: string;
  fontSize: number;
}
```

By providing colors config - you can change the color scheme of your app, without deep diving into theme configuration.

- If you pass `colorsConfig` into `makeOriginUiTheme` - you have to handle theme colors change on your side by substituting the `colorConfig` on `themeMode` change.

3. Helper functions

```
LightenColor(color: string, percent: number, themeMode?: PaletteMode): string
```

- `color` in hex format
- `percent` can be either positive or negative number (int, decimal) reflecting the percentage of a change to be applied. If the number is positive - it will lighten the `color`, if negative - darken.
- `themeMode` - if supplied will keep percent the same number for 'dark' theme, while inverting the number for the 'light' theme.

```
HexToRGBA(hexCode: string, opacity: number) => string;
```

4. Providers

```JSX
<ThemeModeProvider>
   <App />
</ThemeModeProvider>
```

- React context provider.
- Gives access to current `themeMode` via `useThemeModeStore` hook.
- Gives access to `themeMode` `setState` function via `useThemeModeDispatch` hook.

## Contributing Guidelines

See [contributing.md](../../../../../contributing.md)

# Energy Web Decentralized Operating System

EW-Origin is a component of the Energy Web Decentralized Operating System (EW-DOS).

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

- To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/)

For a deep-dive into the motivation and methodology behind our technical solutions, read our White Papers:

- [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
- [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

- [Twitter](https://twitter.com/energywebx)
- [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
- [Telegram](https://t.me/energyweb)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
