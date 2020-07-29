import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers as factory } from '@energyweb/exchange-token-account';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { ethers } from 'ethers';

@Injectable()
export class AccountDeployerService {
    private readonly logger = new Logger(AccountDeployerService.name);

    public constructor(private readonly configService: ConfigService) {}

    public async deployAccount() {
        const deployer = this.configService.get<string>('EXCHANGE_ACCOUNT_DEPLOYER_PRIV');
        const walletAddress = this.configService.get<string>('EXCHANGE_WALLET_PUB');
        const web3ProviderUrl = this.configService.get<string>('WEB3');

        this.logger.debug(`Using ${web3ProviderUrl} for token account deployment`);

        const provider = getProviderWithFallback(...web3ProviderUrl.split(';'));
        const wallet = new ethers.Wallet(deployer, provider);

        const account = await new factory.TokenAccountFactory(wallet).deploy(walletAddress);

        this.logger.debug(
            `Transaction ${account.deployTransaction.hash} has been sent to create account ${account.address}`
        );

        await account.deployed();

        this.logger.debug(`Transaction ${account.deployTransaction.hash} has been confirmed`);

        return account.address;
    }
}
