import Web3 from 'web3';

import { deploy } from '@energyweb/utils-general';

import { Issuer } from './wrappedContracts/Issuer';
import { Registry } from './wrappedContracts/Registry';
import { CertificateTopic } from './const';

import IssuerJSON from '../build/contracts/Issuer.json';
import RegistryJSON from '../build/contracts/Registry.json';

export async function migrateIssuer(
    web3: Web3,
    deployKey: string,
    registryAddress: string
): Promise<Issuer> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const issuerAddress = (
        await deploy(web3, IssuerJSON.bytecode, {
            privateKey: privateKeyDeployment
        })
    ).contractAddress;

    const issuer = new Issuer(web3, issuerAddress);
    await issuer.initialize(CertificateTopic.IREC, registryAddress, accountDeployment, {
        privateKey: privateKeyDeployment
    });

    const version = await issuer.version();
    console.log(`PublicIssuer ${version} created at ${issuerAddress}`);

    return issuer;
}

export async function migrateRegistry(web3: Web3, deployKey: string): Promise<Registry> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const registryAddress = (
        await deploy(web3, RegistryJSON.bytecode, {
            privateKey: privateKeyDeployment
        })
    ).contractAddress;

    const registry = new Registry(web3, registryAddress);
    await registry.initialize({ privateKey: privateKeyDeployment });

    console.log(`Registry created at ${registryAddress}`);

    return registry;
}
