import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import DeviceLogicJSON from '../../build/contracts/lightweight/DeviceLogic.json';

export class DeviceLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile = DeviceLogicJSON;
        const buildFileAbi = buildFile.abi as AbiItem[];

        super(
            address
                ? new web3.eth.Contract(buildFileAbi, address)
                : new web3.eth.Contract(
                      buildFileAbi,
                      (buildFile.networks as any).length > 0 ? (buildFile.networks as any)[0] : null
                  )
        );
        this.web3 = web3;
    }

    async initialize(userContractAddress: string, txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(userContractAddress);

        return this.send(method, txParams);
    }

    async getAllLogDeviceCreatedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogDeviceCreated', this.createFilter(eventFilter));
    }

    async getAllLogDeviceFullyInitializedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogDeviceFullyInitialized', this.createFilter(eventFilter));
    }

    async getAllLogChangeOwnerEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogChangeOwner', this.createFilter(eventFilter));
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', this.createFilter(eventFilter));
    }

    async createDevice(
        _smartMeter: string,
        _owner: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createDevice(
            _smartMeter,
            _owner
        );

        return this.send(method, txParams);
    }

    async getDeviceOwner(_deviceId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDeviceOwner(_deviceId).call(txParams);
    }

    async getDeviceListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDeviceListLength().call(txParams);
    }

    async getDevice(_deviceId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDevice(_deviceId).call(txParams);
    }

    async getDeviceById(_deviceId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDeviceById(_deviceId).call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async userLogicAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userLogicAddress().call(txParams);
    }
}
