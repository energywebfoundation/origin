import { GeneralFunctions } from '@energyweb/utils-general';
import Web3 from 'web3';
import TradableEntityContractJSON from '../../build/contracts/lightweight/TradableEntityContract.json';

export class TradableEntityContract extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = TradableEntityContractJSON;
        super(
            address
                ? new web3.eth.Contract(TradableEntityContractJSON.abi, address)
                : new web3.eth.Contract(
                    buildFile.abi,
                    buildFile.networks.length > 0
                        ? buildFile.networks[0]
                        : null
                )
        );
        this.web3 = web3;
    }
}
