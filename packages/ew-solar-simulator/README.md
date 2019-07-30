# EW Solar Simulator

## Install

- `npm install`

## Configuration

Edit `config/config.json` and configure:
- `ASSET_CONTRACT_LOOKUP_ADDRESS`
- `WEB3_URL`
- `ENERGY_API_BASE_URL`

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