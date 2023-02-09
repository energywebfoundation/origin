import { ethers } from 'ethers';

import { CertificateTopic, DeployParameters } from './const';

import { factories } from './contracts';
import { Issuer } from './ethers/Issuer';
import { RegistryExtended } from './ethers/RegistryExtended';
import { PrivateIssuer } from './ethers/PrivateIssuer';

export async function migratePrivateIssuer(
    provider: ethers.providers.FallbackProvider,
    deployKey: string,
    issuerAddress: string,
    deployParameters?: DeployParameters
): Promise<PrivateIssuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const privateIssuerContract = deployParameters
        ? await new factories.PrivateIssuerFactory(wallet).deploy(deployParameters)
        : await new factories.PrivateIssuerFactory(wallet).deploy();

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
    registryAddress: string,
    deployParameters?: DeployParameters
): Promise<Issuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const issuerContract = deployParameters
        ? await new factories.IssuerFactory(wallet).deploy(deployParameters)
        : await new factories.IssuerFactory(wallet).deploy();

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
    deployParameters?: DeployParameters,
    uri = ''
): Promise<RegistryExtended> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const wallet = new ethers.Wallet(privateKeyDeployment, provider);

    const registryContract = deployParameters
        ? await new factories.RegistryExtendedFactory(wallet).deploy(uri, deployParameters)
        : await new factories.RegistryExtendedFactory(wallet).deploy(uri);

    await registryContract.deployed();

    console.log(`RegistryExtended.sol deployed at ${registryContract.address}`);

    return registryContract;
}
