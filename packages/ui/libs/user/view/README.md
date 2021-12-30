<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI User View

## Description

View layer implementation for the User part (Account/Admin/Auth) of Origin marketplace user interface

Origin UI User View is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-user-view
```

```sh
yarn add @energyweb/origin-ui-user-view
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
    "@mui/lab",
    "@mui/icons-material",
    "clsx",
    "react-i18next",
    "i18next",
    "react-hook-form",
    "dayjs",
    "lodash",
    "query-string",
    "axios",
    "@hookform/resolvers",
    "yup",
    "react-query",
    "@react-google-maps/api",
    "react-beautiful-dnd",
    "react-toastify",
    "react-dropzone",
    "@ethersproject/bignumber",
    "@ethersproject/units",
    "@ethersproject/providers",
    "@energyweb/origin-backend-core",
    "@energyweb/utils-general",
    "@energyweb/origin-backend-react-query-client",
    "@energyweb/origin-organization-irec-api-react-query-client"
    "@energyweb/origin-device-registry-api-react-query-client",
    "@energyweb/origin-device-registry-irec-local-api-react-query-client",
    "@energyweb/issuer-irec-api-react-query-client",
    "@energyweb/exchange-react-query-client",
    "@energyweb/origin-ui-core",
    "@energyweb/origin-ui-theme",
    "@energyweb/origin-ui-shared-state",
    "@energyweb/origin-ui-localization",
    "@energyweb/origin-ui-assets",
    "@energyweb/origin-ui-utils",
    "@energyweb/origin-ui-web3",
    "@energyweb/origin-ui-user-logic",
    "@energyweb/origin-ui-user-data",
```

### Usage

- Since User View - is a UI app consisting of several parts (Account/Admin/Auth/Confirm-Email) - you have to register their routes separately.
  To use the default setup simply connect all of the app to your routing an pass required env variables and routes configuration:

```JSX
import { Routes, Route } from 'react-router-dom';
import {
  AccountApp,
  AdminApp,
  AuthApp,
  LoginApp,
  ConfirmEmailApp
} from '@energyweb/origin-ui-user-view';

export const App = () => {
  return (
    <Routes>
       <Route
          path="account/*"
          element={
            <AccountApp
              routesConfig={accountRoutes}
              envVariables={{
                allowedChainIds: [1, 2, 3],
                registrationMessage: 'Hello, world!',
              }}
            />
          }
        />
        <Route
          path="admin/*"
          element={<AdminApp routesConfig={adminRoutes} />}
        />
        <Route
          path="auth/*"
          element={
              <AuthApp
                routesConfig={{ showRegister: !isAuthenticated }}
              />
          }
        />
        <Route
          path="/login/*"
          element={<LoginApp routesConfig={loginRoutes} />}
        />
        <Route
          path="/confirm-email"
          element={<ConfirmEmailApp />}
        />
    </Routes>
  )
}
```

- To remove certain pages, add you own custom page - you have to re-configure the UI app you need and use your own custom instance:

```JSX
import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import {
  UserAppEnvProvider,
  UserEnvVariables,
  ProfilePage,
  SettingsPage
} from '@energyweb/origin-ui-user-view';
// using local folder
import { CustomPage } from './components';

export interface AccountAppProps {
  envVariables: UserEnvVariables;
}

export const AccountApp: FC<AccountAppProps> = ({ envVariables }) => {
  return (
    // Certain pages consume env variable from this context
    // so make sure you only extend it, not edit
    <UserAppEnvProvider variables={envVariables}>
      <Routes>
        <Route path="profile" element={<ProfilePage />} />

        // This page now won't appear on our app
        // <Route path="settings" element={<SettingsPage />} />

        // This will add a new page to Account UI app
        <Route path="custom-page" element={<CustomPage />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </UserAppEnvProvider>
  );
};
```

Same rules apply to all the other UI apps of `@energyweb/origin-ui-user-view`. [See other apps references](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/user/view/src)

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
