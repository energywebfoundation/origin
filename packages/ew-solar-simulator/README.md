# EW Solar Simulator

## Overview

Consists of 2 services:

1. Simulation
2. Consumer

### Simulation

This is a service that simulates API for getting energy data. Based on asset configuration it returns mock data for solar assets, based on real data for whole year in 15-mins intervals. Simulation service exposes it's API for HTTP requests that Consumer service is using.

### Consumer

Queries Simulation service for energy data for configured assets, and if it sees that there are new energy entries, it writes them to Origin blockchain smart-contracts as smart meter reads.

## Install

- `npm install`

## Configuration

To run simulator and consumer services you need to deploy Origin first. For more info check [Docker deployment](https://github.com/energywebfoundation/origin/wiki/Docker-Deployment).

### General

Edit `config/config.json` and configure:
- `ASSET_CONTRACT_LOOKUP_ADDRESS` - this is `AddressContractLookup` smart-contract address, you can get it via output of Origin deployment script ("info: Asset Contract Deployed: X", where X is the address you need)
- `WEB3_URL` - by default configured to local Ganache instance (`http://localhost:8545`), if you've deployed Origin to Volta, use: `https://volta-rpc.energyweb.org`
- `ENERGY_API_BASE_URL` - the address on which simulation process is running, by default locally it's `http://localhost:3031`, in Docker it's `http://simulation:3031`

### Asset

Edit asset configuration in `config/config.json`. Properties:
- `maxCapacity` - maximum asset capacity in Wh
- `smartMeterPrivateKey` - private key of smart meter device to save reads on-chain

Place example energy generation data in `config/data.csv` in the following format:

```
Time,E/Cap ratio (kWh/kW),5 MW example (kWh)
01.01.2015 00:00,0,0.00
01.01.2015 00:15,0,0.00
01.01.2015 07:45,0.000664,3.32
```

## Docker

After making sure you've configured everything properly, run:

```
docker-compose up -d
```

If you'd like to inspect logs run:

```
docker-compose logs simulation
docker-compose logs consumer
```