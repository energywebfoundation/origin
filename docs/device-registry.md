# Device Registry SDK

## Overview
The Device Registry SDK is used to register and fetch devices and meter data.  

‘Devices’ are electricity generating assets (e.g solar pv, hydroelectric dam, steam turbine). Because [Energy Attribute Certificates](././user-guide-glossary.md.md#energy-attribute-certificate) are always tied to the device for which generation evidence was submitted, generation devices must be registered with Origin. Read more about the role of devices on the platform [here](./user-guide-reg-onboarding.md#devices). 

## Device Registry SDK Packages  
The Device Registry SDK has two core packages:  

### 1. [Device Registry API - @energyweb/origin-device-registry-api](./device-registry/device-registry-api.md)
A [NestJS](https://nestjs.com/) application to fetch and persist devices.

See the documentation for this package [here](./device-registry/device-registry-api.md). 

### 2. [Origin Energy API - @energyweb/origin-energy-api](https://github.com/energywebfoundation/origin/tree/master/packages/devices/origin-energy-api)
A [NestJS](https://nestjs.com/) application to fetch and aggregate meter readings using a Meter Id. 