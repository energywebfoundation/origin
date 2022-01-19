<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Organization View

## Description

View layer implementation for the Organization part of Origin marketplace user interface

Origin UI Organization View is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) SDK.

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-organization-view
```

```sh
yarn add @energyweb/origin-ui-organization-view
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
    "lodash",
    "dayjs",
    "react-hook-form",
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
    "@energyweb/utils-general",
    "@energyweb/origin-backend-core",
    "@energyweb/origin-organization-irec-api-react-query-client",
    "@energyweb/origin-backend-react-query-client",
    "@energyweb/origin-ui-theme",
    "@energyweb/origin-ui-shared-state",
    "@energyweb/origin-ui-localization",
    "@energyweb/origin-ui-core",
    "@energyweb/origin-ui-assets",
    "@energyweb/origin-ui-utils",
    "@energyweb/origin-ui-organization-logic",
    "@energyweb/origin-ui-organization-data"
```

### Usage

- To use the default setup simply connect Organization UI app to your routing an pass required env variables and routes configuration:

```JSX
import { Routes, Route } from 'react-router-dom';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';

export const App = () => {
  return (
    <Routes>
      <Route
        path="organization/*"
        element={
          <OrganizationApp routesConfig={orgRoutes} />
        }
      />
    </Routes>
  )
}
```

- To remove certain pages, add you own custom page - you have to re-configure the Organization UI app and use your own custom instance:

```JSX
import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  OrganizationModalsCenter,
  OrganizationModalsProvider,
  ConnectIRecPage,
  CreateBeneficiaryPage,
  InvitationsPage,
  InvitePage,
  MembersPage,
  OrganizationViewPage,
  RegisterIRecPage,
  RegisterPage,
} from '@energyweb/origin-ui-organization-view';
// using local folder
import { CustomPage } from './components';

export const OrganizationApp: FC = () => {
  return (
    // Some pages trigger modal open using this context
    <OrganizationModalsProvider>
      <Routes>
        <Route path="my" element={<OrganizationViewPage />} />}
        <Route
          path="invitations"
          element={<InvitationsPage redirectToIndex={false} />}
        />
        <Route path="invite" element={<InvitePage />} />}
        <Route path="members" element={<MembersPage />} />}
        <Route path="register" element={<RegisterPage />} />
        <Route path="register-irec" element={<RegisterIRecPage />} />
        <Route
          path="create-beneficiary"
          element={<CreateBeneficiaryPage />}
        />

        // This page now won't appear on our app
        // <Route path="connect-irec" element={<ConnectIRecPage />} />

        // This will add a new page to Device UI app
        <Route path="custom-page" element={<CustomPage />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <OrganizationModalsCenter />
    </OrganizationModalsProvider>
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
