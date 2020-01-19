import Web3 from 'web3';
import { Contracts, ProxyAdminProject, ZWeb3, Contract } from '@openzeppelin/upgrades';
import { PublicIssuer } from './wrappedContracts/PublicIssuer';
import { PrivateIssuer } from './wrappedContracts/PrivateIssuer';
import { Registry } from './wrappedContracts/Registry';

export async function migratePublicIssuer(web3: Web3, deployKey: string, registryAddress: string): Promise<PublicIssuer> {
    ZWeb3.initialize(web3.currentProvider);

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const from = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const project = new ProxyAdminProject('PublicIssuer', null, null, { from });

    const publicIssuerContract = Contracts.getFromLocal('PublicIssuer');
    const instance = await project.createProxy(publicIssuerContract, { initMethod: 'initialize', initArgs: [registryAddress] });
    const address = instance.options.address;

    const publicIssuer = new PublicIssuer(web3, address);
    const version = await publicIssuer.version();
    console.log(`PublicIssuer ${version} created at ${address}`);

    return publicIssuer;
}

export async function migratePrivateIssuer(web3: Web3, deployKey: string, registryAddress: string, publicIssuerAddress: string): Promise<PrivateIssuer> {
    ZWeb3.initialize(web3.currentProvider);

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const from = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const project = new ProxyAdminProject('PrivateIssuer', null, null, { from });

    const privateIssuerContract = Contracts.getFromLocal('PrivateIssuer');
    const instance = await project.createProxy(privateIssuerContract, { initMethod: 'initialize', initArgs: [registryAddress, publicIssuerAddress] });
    const address = instance.options.address;

    const privateIssuer = new PrivateIssuer(web3, address);
    const version = await privateIssuer.version();
    console.log(`PrivateIssuer ${version} created at ${address}`);

    return privateIssuer;
}

export async function migrateRegistry(web3: Web3, deployKey: string): Promise<Registry> {
    ZWeb3.initialize(web3.currentProvider);

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const from = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const project = new ProxyAdminProject('Registry', null, null, { from });

    const registryContract = Contracts.getFromLocal('Registry');
    const instance = await project.createProxy(registryContract);
    const address = instance.options.address;


    console.log(`Registry created at ${address}`);

    return new Registry(web3, address);
}