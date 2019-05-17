import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
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
