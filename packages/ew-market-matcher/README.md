# ew-market-matcher

A matcher automates buying and selling certificates on the Origin platform.

## How-to

Update the config file in [example-conf/production-conf.json](example-conf/production-conf.json)
- Make sure that `marketContractLookupAddress` and `originContractLookupAddress` match your deployed Origin contracts

### Install
Install the dependencies for the Matcher.
- `npm install`

### Run
- `npm start example-conf/production-conf.json`
