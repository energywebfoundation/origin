import { GeneralFunctions } from './GeneralFunctions';
import Web3 = require('web3');
import AssetGeneralStructContractJSON from '../../build/contracts/AssetGeneralStructContract.json';

export class AssetGeneralStructContract extends GeneralFunctions {
    web3: Web3;
    buildFile = AssetGeneralStructContractJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AssetGeneralStructContractJSON.abi, address)
                : new web3.eth.Contract(
                      AssetGeneralStructContractJSON.abi,
                      (AssetGeneralStructContractJSON as any).networks.length > 0
                          ? AssetGeneralStructContractJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }
}
