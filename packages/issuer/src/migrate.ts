import { ethers } from 'ethers';

import { CertificateTopic } from './const';

import { factories } from './contracts';
import { Issuer } from './ethers/Issuer';
import { Registry } from './ethers/Registry';

export async function migrateIssuer(
    web3ProviderUrl: string,
    deployKey: string,
    registryAddress: string
): Promise<Issuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const issuerContract = await new factories.IssuerFactory(wallet).deploy();

    await issuerContract.initialize(CertificateTopic.IREC, registryAddress, wallet.address);

    const version = await issuerContract.version();
    console.log(`Issuer ${version} created at ${issuerContract.address}`);

    return issuerContract;
}

export async function migrateRegistry(
    web3ProviderUrl: string,
    deployKey: string
): Promise<Registry> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const registryContract = await new factories.RegistryFactory(wallet).deploy();

    await registryContract.initialize();

    console.log(`Registry created at ${registryContract.address}`);

    return registryContract;
}
