# EW Solar Simulator

## Overview

Consists of 2 services:

1. Simulation
2. Consumer

### Simulation

This is a service that simulates API for getting energy data. Based on device configuration it returns mock data for solar devices, based on real data for whole year in 15-mins intervals. Simulation service exposes it's API for HTTP requests that Consumer service is using.

Run:
```
yarn start-simulation
```

or from the root of monorepo:

```
yarn run:simulator:server
```

### Consumer

Queries Simulation service for energy data for configured devices, and if it sees that there are new energy entries, it writes them to Origin blockchain smart-contracts as smart meter reads.

Run:
```
yarn start-consuming-api
```

or from the root of monorepo:

```
yarn run:simulator:consumer
```

## Configuration

To run simulator and consumer services you need to deploy Origin first.

### General

Edit `.env` in the root of the monorepo and configure:
- `ENERGY_API_BASE_URL` - the address on which simulation server is running, by default locally it's `http://localhost:3032`, in Docker it's `http://simulation:3032`

### Device

Edit device configuration in `config/config.json`. Properties:
- `maxCapacity` - maximum device capacity in Wh
- `smartMeterPrivateKey` - private key of a smart meter device to save reads on-chain

Place example energy generation data in `config/data.csv` in the following format:

```
Time,E/Cap ratio (kWh/kW),5 MW example (kWh)
01.01.2015 00:00,0,0.00
01.01.2015 00:15,0,0.00
01.01.2015 07:45,0.000664,3.32
```

### How to import I-REC public devices

I-REC lists all public registered devices in https://registry.irecservices.com/Public/ReportDevices/ where you can filter and download public devices as CSV file.

We have created 2 scripts to allow easy import of those devices.

#### import-irec-devices script

```
Usage: yarn import-irec-devices -- [options]

Options:
  -i, --input <path>       input I-REC csv file
  -o, --owner <address>    address of the device owner
  -h, --help               output usage information
```

As an outcome of running this script we will receive 2 products:

1. new `config/config.json` with updated `devices` field based on input CSV file
2. json console output with commands necessary to setup demo environment https://github.com/energywebfoundation/ew-utils-demo/blob/master/config/demo-config.json
