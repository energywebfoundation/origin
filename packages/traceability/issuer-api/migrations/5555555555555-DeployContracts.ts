import path from 'path';
import fs from 'fs';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { providers } from 'ethers';
import { Contracts as IssuerContracts, IContractsLookup } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';

const getEnvFilePath = () => {
    const pathsToTest = ['../../../../../.env', '../../../../../../.env'];

    let finalPath = null;

    for (const pathToTest of pathsToTest) {
        const resolvedPath = path.resolve(__dirname, pathToTest);

        if (__dirname.includes('dist/js') && fs.existsSync(resolvedPath)) {
            finalPath = resolvedPath;
            break;
        }
    }

    return finalPath;
};

const envPath = getEnvFilePath();

if (envPath) {
    require('dotenv').config({ path: envPath });
}
export class DeployContracts5555555555555 implements MigrationInterface {
    private deployKey: string;
    private web3: string;

    name = 'DeployContracts5555555555555';

    constructor() {
        if (!process.env.DEPLOY_KEY) {
            throw new Error('Variable DEPLOY_KEY is not defined');
        }

        if (!process.env.WEB3) {
            throw new Error('Variable WEB3 is not defined');
        }

        const deployKey = process.env.DEPLOY_KEY!;

        this.web3 = process.env.WEB3!;
        this.deployKey = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const [{ count }] = await queryRunner.query(
            'SELECT COUNT(*) as count FROM public.issuer_blockchain_properties'
        );

        if (Number(count) !== 0) {
            // Because this migration was added later in time,
            // we don't want to break running environments, that already implemented this behavior
            // by themselves
            return;
        }

        await this.seedBlockchain(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

    private async seedBlockchain(queryRunner: QueryRunner): Promise<IContractsLookup> {
        const [primaryRpc, fallbackRpc] = this.web3.split(';');
        const provider = getProviderWithFallback(primaryRpc, fallbackRpc);
        const contractsLookup = await this.deployContracts(provider);

        await queryRunner.query(
            `INSERT INTO public.issuer_blockchain_properties ("netId", "registry", "issuer", "privateIssuer", "rpcNode", "rpcNodeFallback", "platformOperatorPrivateKey") VALUES (${
                provider.network.chainId
            }, '${contractsLookup.registry}', '${contractsLookup.issuer}', '${
                contractsLookup.privateIssuer
            }', '${primaryRpc}', '${fallbackRpc ?? ''}', '${this.deployKey}')`
        );

        return contractsLookup;
    }

    private async deployContracts(provider: providers.FallbackProvider): Promise<IContractsLookup> {
        const registry = await IssuerContracts.migrateRegistry(provider, this.deployKey);
        const issuer = await IssuerContracts.migrateIssuer(
            provider,
            this.deployKey,
            registry.address
        );
        const privateIssuer = await IssuerContracts.migratePrivateIssuer(
            provider,
            this.deployKey,
            issuer.address
        );

        await issuer.setPrivateIssuer(privateIssuer.address);

        return {
            registry: registry.address,
            issuer: issuer.address,
            privateIssuer: privateIssuer.address
        };
    }
}
