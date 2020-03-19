import Web3 from 'web3';

import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { IContractsLookup } from '@energyweb/origin-backend-core';
import writeJsonFile from 'write-json-file';
import { logger } from './Logger';

export async function deployEmptyContracts(): Promise<IContractsLookup> {
    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    console.log('-----------------------------------------------------------');

    const registry = await IssuerContracts.migrateRegistry(web3, adminPK);
    const registryAddress = registry.web3Contract.options.address;
    logger.info(`Registry Contract Deployed: ${registryAddress}`);

    const issuer = await IssuerContracts.migrateIssuer(web3, adminPK, registryAddress);
    const issuerAddress = issuer.web3Contract.options.address;
    logger.info(`Issuer Deployed: ${issuerAddress}`);

    console.log('-----------------------------------------------------------\n');

    // save addresses in a config file
    const deployResult: IContractsLookup = {
        registry: registryAddress,
        issuer: issuerAddress
    };

    await writeJsonFile('./config/contractConfig.json', deployResult);

    return deployResult;
}
