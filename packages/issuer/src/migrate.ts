import Web3 from 'web3';

import { deploy } from '@energyweb/utils-general';

import { PublicIssuer } from './wrappedContracts/PublicIssuer';
import { PrivateIssuer } from './wrappedContracts/PrivateIssuer';
import { Registry } from './wrappedContracts/Registry';

import PublicIssuerJSON from '../build/contracts/PublicIssuer.json';
import PrivateIssuerJSON from '../build/contracts/PrivateIssuer.json';
import RegistryJSON from '../build/contracts/Registry.json';

export async function migratePublicIssuer(web3: Web3, deployKey: string, registryAddress: string): Promise<PublicIssuer> {

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const publicIssuerAddress = (await deploy(web3, PublicIssuerJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const publicIssuer = new PublicIssuer(web3, publicIssuerAddress);
    await publicIssuer.initialize(registryAddress, accountDeployment, {
        privateKey: privateKeyDeployment
    });

    const version = await publicIssuer.version();
    console.log(`PublicIssuer ${version} created at ${publicIssuerAddress}`);

    return publicIssuer;
}

export async function migratePrivateIssuer(web3: Web3, deployKey: string, registryAddress: string, publicIssuerAddress: string): Promise<PrivateIssuer> {

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const privateIssuerAddress = (await deploy(web3, PrivateIssuerJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const privateIssuer = new PrivateIssuer(web3, privateIssuerAddress);
    await privateIssuer.initialize(registryAddress, publicIssuerAddress, accountDeployment, {
        privateKey: privateKeyDeployment
    });

    const version = await privateIssuer.version();
    console.log(`PrivateIssuer ${version} created at ${privateIssuerAddress}`);

    return privateIssuer;
}

export async function migrateRegistry(web3: Web3, deployKey: string): Promise<Registry> {

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const registryAddress = (await deploy(web3, RegistryJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const registry = new Registry(web3, registryAddress);
    await registry.initialize({ privateKey: privateKeyDeployment });

    console.log(`Registry created at ${registryAddress}`);

    return registry;
}