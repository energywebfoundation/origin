import { ethers } from 'ethers';

import { CertificateTopic } from './const';

import { factories } from './contracts';
import { Issuer } from './ethers/Issuer';
import { RegistryExtended } from './ethers/RegistryExtended';
import { PrivateIssuer } from './ethers/PrivateIssuer';

export async function migratePrivateIssuer(
    provider: ethers.providers.FallbackProvider,
    deployKey: string,
    issuerAddress: string
): Promise<PrivateIssuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const privateIssuerContract = await new factories.PrivateIssuerFactory(wallet).deploy();
    await privateIssuerContract.deployed();

    const tx = await privateIssuerContract.initialize(issuerAddress);
    await tx.wait();

    const version = await privateIssuerContract.version();
    console.log(`PrivateIssuer ${version} created at ${privateIssuerContract.address}`);

    return privateIssuerContract;
}

export async function migrateIssuer(
    provider: ethers.providers.FallbackProvider,
    deployKey: string,
    registryAddress: string
): Promise<Issuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const issuerContract = await new factories.IssuerFactory(wallet).deploy();
    await issuerContract.deployed();

    const tx = await issuerContract.initialize(CertificateTopic.IREC, registryAddress);
    await tx.wait();

    const version = await issuerContract.version();
    console.log(`Issuer ${version} created at ${issuerContract.address}`);

    return issuerContract;
}

export async function migrateRegistry(
    provider: ethers.providers.FallbackProvider,
    deployKey: string,
    uri: string = ''
): Promise<RegistryExtended> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const registryContract = await new factories.RegistryExtendedFactory(wallet).deploy(uri);
    await registryContract.deployed();

    console.log(`RegistryExtended.sol deployed at ${registryContract.address}`);

    return registryContract;
}
