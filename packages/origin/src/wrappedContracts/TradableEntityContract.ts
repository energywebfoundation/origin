import { GeneralFunctions } from './GeneralFunctions';
import Web3 = require('web3');
import TradableEntityContractJSON from '../../build/contracts/TradableEntityContract.json';

export class TradableEntityContract extends GeneralFunctions {
    web3: Web3;
    buildFile = TradableEntityContractJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(TradableEntityContractJSON.abi, address)
                : new web3.eth.Contract(
                      TradableEntityContractJSON.abi,
                      (TradableEntityContractJSON as any).networks.length > 0
                          ? TradableEntityContractJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }
}
