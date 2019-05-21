import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
import CertificateSpecificContractJSON from '../../build/contracts/CertificateSpecificContract.json';

export class CertificateSpecificContract extends GeneralFunctions {
    web3: Web3;
    buildFile = CertificateSpecificContractJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(CertificateSpecificContractJSON.abi, address)
                : new web3.eth.Contract(
                      CertificateSpecificContractJSON.abi,
                      (CertificateSpecificContractJSON as any).networks.length > 0
                          ? CertificateSpecificContractJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }
}
