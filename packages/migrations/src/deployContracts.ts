import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { IContractsLookup } from '@energyweb/origin-backend-core';

export async function deployContracts(): Promise<IContractsLookup> {
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const registry = await IssuerContracts.migrateRegistry(process.env.WEB3, adminPK);

    const issuer = await IssuerContracts.migrateIssuer(process.env.WEB3, adminPK, registry.address);

    return {
        registry: registry.address,
        issuer: issuer.address
    };
}
