<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Assets

## Description

Package contains all the assets (images and icons) required to built a Origin Marketplace user interface.

Icons from this package are exported as React Components using [react-svgr](https://react-svgr.com/) package.

Origin UI Assets is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-assets
```

```sh
yarn add @energyweb/origin-ui-assets
```

### Requirements

Before installing, download and install `react` >= 17.0.2

### Usage

Proper styling and usage of this components depends on Material-UI theme provider setup. Here is the basic example of seting up the provider and using it in your app with pre-configured origin theme:

```JSX
import React, { FC } from 'react';
import { makeOriginUiTheme } from '@energyweb/origin-ui-theme';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';

export const OriginThemeProvider = ({ children }) => {
  const originTheme = makeOriginUiTheme();
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
