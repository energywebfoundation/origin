import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AccessTokens, IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshAllTokensCommand } from '../commands';
import { Connection } from '../connection.entity';

@CommandHandler(RefreshAllTokensCommand)
export class RefreshAllTokensHandler implements ICommandHandler<RefreshAllTokensCommand> {
    private readonly logger = new Logger(RefreshAllTokensHandler.name);

    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly configService: ConfigService
    ) {}

    async execute(): Promise<void> {
        if (!this.isIrecIntegrationEnabled()) {
            return;
        }

        this.logger.log('Started RefreshAllTokensHandler command');
        const irecApiUrl = this.configService.get<string>('IREC_API_URL');

        const expiredConnections = await this.repository.find({
            where: {
                expiryDate: LessThan(new Date())
            }
        });

        if (!expiredConnections.length) {
            this.logger.log('Expired IREC connections not found');
            return;
        }

        const results = await Promise.allSettled(
            expiredConnections.map(async (irecConnection) => {
                const client = new IRECAPIClient(irecApiUrl, {
                    accessToken: irecConnection.accessToken,
                    refreshToken: irecConnection.refreshToken,
                    expiryDate: irecConnection.expiryDate
                });

                client.on('tokensRefreshed', (accessToken: AccessTokens) => {
                    this.repository.update(irecConnection.id, accessToken).catch(() => {
                        this.logger.warn(
                            `Unable to update IREC access tokens for registration ${irecConnection.registration}`
                        );
                    });
                    client.removeAllListeners();
                });

                await client.organisation.get();
            })
        );

        const updated = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        this.logger.log(
            `Update IREC access tokens finished, updated: ${updated}, failed: ${failed}`
        );
    }

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }
}
