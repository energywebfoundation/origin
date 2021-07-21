import { providers } from 'ethers';
import { Contracts as IssuerContracts, IContractsLookup } from '@energyweb/issuer';

export async function deployContracts(
    provider: providers.FallbackProvider
): Promise<IContractsLookup> {
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const registry = await IssuerContracts.migrateRegistry(provider, adminPK);
    const issuer = await IssuerContracts.migrateIssuer(provider, adminPK, registry.address);
    const privateIssuer = await IssuerContracts.migratePrivateIssuer(
        provider,
        adminPK,
        issuer.address
    );

    return {
        registry: registry.address,
        issuer: issuer.address,
        privateIssuer: privateIssuer.address
    };
}
