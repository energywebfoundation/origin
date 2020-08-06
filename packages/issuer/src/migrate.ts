import { ethers } from 'ethers';

import { CertificateTopic } from './const';

import { factories } from './contracts';
import { Issuer } from './ethers/Issuer';
import { Registry } from './ethers/Registry';

export async function migrateIssuer(
    provider: ethers.providers.FallbackProvider,
    deployKey: string,
    registryAddress: string
): Promise<Issuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const issuerContract = await new factories.IssuerFactory(wallet).deploy();
    await issuerContract.deployed();

    const tx = await issuerContract['initialize(int256,address,address)'](
        CertificateTopic.IREC,
        registryAddress,
        wallet.address
    );
    await tx.wait();

    const version = await issuerContract.version();
    console.log(`Issuer ${version} created at ${issuerContract.address}`);

    return issuerContract;
}

export async function migrateRegistry(
    provider: ethers.providers.FallbackProvider,
    deployKey: string
): Promise<Registry> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const registryContract = await new factories.RegistryFactory(wallet).deploy();
    await registryContract.deployed();

    console.log(`Registry created at ${registryContract.address}`);

    return registryContract;
}
