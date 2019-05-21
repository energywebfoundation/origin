import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
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
