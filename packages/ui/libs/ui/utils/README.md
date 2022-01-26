<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Utils

## Description

UI general utils library for building Origin marketplace user interface.

Origin UI Assets is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-utils
```

```sh
yarn add @energyweb/origin-ui-utils
```

### Usage

1. `isArrayEqual` - Checks if two arrays are equal using `lodash` modular methods.

```
isArrayEqual(arrayOne: T[], arrayTwo: T[]): boolean
```

2. `COUNTRY_OPTIONS_ISO` - An array of country options with ISO country code as `value` and country name as `label`

```
COUNTRY_OPTIONS_ISO: { value: string, label: string }[]
```

3. `DateFormatEnum` - Enum containing Date-Time formats used in Origin

```
enum DateFormatEnum {
  DATE_FORMAT_MDY = 'MMM D, YYYY',
  DATE_FORMAT_DMY = 'DD/MM/YYYY',
  DATE_FORMAT_MONTH_AND_YEAR = 'MMM, YYYY',
  DATE_FORMAT_FULL_YEAR = 'YYYY',
  DATE_FORMAT_INCLUDING_TIME = `MMM D, YYYY hh:mm a`,
}
```

4. `formatDate` - function formatting dates/timestamps/dayjs-objects to the most used date format 'MMM D, YYYY' in displaying dates in user interface

```
formatDate(date: Dayjs | number | string): 'MMM D, YYYY'

const includeTime = true;
formatDate(date, includeTime): `MMM D, YYYY hh:mm a`

const timezone = 'Asia/Bangkok'
// by default uses dayjs.tz.guess()
formatDate(date, false, timezone): 'MMM D, YYYY'
```

5. `EnergyFormatter` - function for formatting energy values from MWh to Wh and from Wh to MWh.

```
const amountInWh = 100000;
const mWhAmount = 365;

EnergyFormatter.getValueInDisplayUnit(amountInWh): 100

EnergyFormatter.getBaseValueFromValueInDisplayUnit(mWhAmount): BigNumber.from(365000)

EnergyFormatter.format(amountInWh): "100"
EnergyFormatter.format(amountInWh, true): "100 MWh"
```

6. `PowerFormatter` - function for formatting power values from MW to W and from W to MW.

```
const amountInW = 987000;
const mWAmount = 123;

PowerFormatter.getBaseValueFromValueInDisplayUnit(mWAmount): "123000"

PowerFormatter.format(amountInW): "987"
PowerFormatter.format(amountInW, true): "987 MW"
```

7. Currency formatters
   `formatCurrency(value)` - formats the number or string using `Intl.NumberFormat` to USD currency style without '$' sign.
   `formatCurrencyComplete(value, currency = 'usd')` - formats the number or string to currency format using `Intl.NumberFormat` with 2 digits displaying the currency sign.

8. `useQueryParams` - hook for retrieving query params.

9. `useQueryString` - hook for receiving parsed query string via `query-string` package.

10. `EnergyTypeEnum` - enum containing all energy types used in Origin user interface. This is mainly used for icons displaying.

```
  WIND = 'wind',
  SOLAR = 'solar',
  HYDRO = 'hydro-electric',
  MARINE_TIDAL = 'marine tidal',
  MARINE_WAVE = 'marine wave',
  MARINE_CURRENT = 'marine current',
  MARINE_VERTICAL = 'marine vertical pressure',
  RENEWABLE_HEAT = 'renewable heat',
  BIOMASS_SOLID = 'biomass solid',
  BIOMASS_LIQUID = 'biomass liquid',
  BIOGAS = 'biogas',
  CO_FIRED_WITH_FOSSIL = 'co-fired with fossil',
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
