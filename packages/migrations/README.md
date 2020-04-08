# Origin Migrations

This repository is used to deploy all the contracts and migrate all the data for the Origin project of the Energy Web Foundation.

## How-to
- `npm install` - Install the dependencies

## Running
0. You need to have Postgres running with a clean new database called `origin`.
1. `yarn start-ganache` - Starts a local blockchain instance (or use Volta)
2. (new terminal window) `yarn start:redeploy`. This will redeploy the contracts every time. Use `yarn start` in production.
3. (new terminal window) `yarn start-backend` - Starts a local backend instance
4. (new terminal window) You can now start the UI by running `yarn run:ui` from the root of the monorepo