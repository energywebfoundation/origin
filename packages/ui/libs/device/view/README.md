<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Device View

## Description

View layer implementation for the Device part of Origin marketplace user interface

Origin UI Device View is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-device-view
```

```sh
yarn add @energyweb/origin-ui-device-view
```

### Requirements

Before installing make sure you have all the peerDependencies installed:

```
    "react",
    "react-router",
    "react-router-dom",
    "emotion-theming",
    "@emotion/react",
    "@mui/material",
    "@mui/styles",
    "@mui/icons-material",
    "@mui/lab"alpha.59",
    "clsx",
    "react-i18next",
    "i18next",
    "react-hook-form",
    "@hookform/resolvers",
    "yup",
    "dayjs",
    "lodash",
    "query-string",
    "axios",
    "@react-google-maps/api",
    "react-beautiful-dnd",
    "react-toastify",
    "react-dropzone",
    "react-query",
    "react-chartjs-2",
    "chart.js"
    "@ethersproject/bignumber",
    "@ethersproject/units",
    "@energyweb/origin-backend-core",
    "@energyweb/utils-general"",
    "@energyweb/origin-energy-api-react-query-client",
    "@energyweb/origin-device-registry-irec-local-api-react-query-client",
    "@energyweb/origin-organization-irec-api-react-query-client",
    "@energyweb/origin-backend-react-query-client",
    "@energyweb/origin-device-registry-api-react-query-client",
    "@energyweb/issuer-irec-api-react-query-client",
    "@energyweb/exchange-react-query-client",
    "@energyweb/origin-ui-core",
    "@energyweb/origin-ui-theme",
    "@energyweb/origin-ui-shared-state",
    "@energyweb/origin-ui-localization",
    "@energyweb/origin-ui-assets",
    "@energyweb/origin-ui-utils",
    "@energyweb/origin-ui-device-data",
    "@energyweb/origin-ui-device-logic",

```

### Usage

- To use the default setup simply connect Device UI app to your routing an pass required env variables and routes configuration:

```JSX
import { Routes, Route } from 'react-router-dom';
import { DeviceApp } from '@energyweb/origin-ui-device-view';

export const App = () => {
  return (
    <Routes>
      <Route
        path="device/*"
        element={
          <DeviceApp
            routesConfig={deviceRoutes}
            envVariables={{
              singleAccountMode: /true/i.test('false'),
              googleMapsApiKey: 'API key',
              smartMeterId: 'Smart Meter ID',
            }}
          />
        }
      />
    </Routes>
  )
}
```

- To remove certain pages, add you own custom page - you have to re-configure the Device UI app and use your own custom instance:

```JSX
import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  DeviceModalsCenter,
  DeviceAppEnvProvider,
  DeviceEnvVariables,
  DeviceModalsProvider,
  AllDevicesPage,
  DetailViewPage,
  DeviceImportPage,
  MapViewPage,
  MyDevicesPage,
  PendingPage,
  RegisterPage,
  EditDevicePage,
} from '@energyweb/origin-ui-device-view';
// using local folder
import { CustomPage } from './components';

export interface DeviceAppProps {
  envVariables: DeviceEnvVariables;
}

export const DeviceApp: FC<DeviceAppProps> = ({ envVariables }) => {
  return (
    // Certain pages consume env variable from this context
    // so make sure you only extend it, not edit
    <DeviceAppEnvProvider variables={envVariables}>
    // Some pages trigger modal open using this context
      <DeviceModalsProvider>
        <Routes>
          <Route path="all" element={<AllDevicesPage />} />
          <Route path="map" element={<MapViewPage />} />
          <Route path="my" element={<MyDevicesPage />} />
          <Route path="pending" element={<PendingPage />} />
          <Route path="register" element={<RegisterPage />} />

          // This page now won't appear on our app
          // <Route path="import" element={<DeviceImportPage />} />

          // This will add a new page to Device UI app
          <Route path="custom-page" element={<CustomPage />} />

          <Route path="detail-view/:id" element={<DetailViewPage />} />
          <Route path="edit/:id" element={<EditDevicePage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <DeviceModalsCenter />
      </DeviceModalsProvider>
    </DeviceAppEnvProvider>
  );
};
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
