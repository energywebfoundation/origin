<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Localization

## Description

Localization library for building Origin marketplace user interface.

Origin UI Localization is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-localization
```

```sh
yarn add @energyweb/origin-ui-localization
```

### Usage

In your `App.j(t)sx` file import and use the initialize function as follows:

```JSX
import { initializeI18N } from '@energyweb/origin-ui-localization';

initializeI18N('en');

export const App = () => {
  return (...)
}
```

You can also use the helper function to retrieve the current language from localStorage:

```JSX
import { initializeI18N } from '@energyweb/origin-ui-localization';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';

initializeI18N(getOriginLanguage());

export const App = () => {
  return (...)
}
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
