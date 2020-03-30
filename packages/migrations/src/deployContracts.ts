import Web3 from 'web3';

import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { IContractsLookup } from '@energyweb/origin-backend-core';

export async function deployContracts(): Promise<IContractsLookup> {
    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const registry = await IssuerContracts.migrateRegistry(web3, adminPK);
    const registryAddress = registry.web3Contract.options.address;

    const issuer = await IssuerContracts.migrateIssuer(web3, adminPK, registryAddress);

    return {
        registry: registryAddress,
        issuer: issuer.web3Contract.options.address
    };
}
