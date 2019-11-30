import * as ProducingDevice from './blockchain-facade/ProducingDevice';
import * as ConsumingDevice from './blockchain-facade/ConsumingDevice';
import * as Device from './blockchain-facade/Device';
import * as Contracts from './contracts';

import DevicePropertiesOffChainSchema from '../schemas/DevicePropertiesOffChain.schema.json';
import ProducingDevicePropertiesOffChainSchema from '../schemas/ProducingDevicePropertiesOffChain.schema.json';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

import { DeviceLogic } from './wrappedContracts/DeviceLogic';

export {
    Contracts,
    ProducingDevice,
    ConsumingDevice,
    Device,
    DeviceLogic,
    DevicePropertiesOffChainSchema,
    ProducingDevicePropertiesOffChainSchema,
    createBlockchainProperties
};

