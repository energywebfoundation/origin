import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AccessTokens, IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshAllTokensCommand } from '../commands';
import { Connection } from '../connection.entity';

const MAX_ATTEMPTS = 5;

@CommandHandler(RefreshAllTokensCommand)
export class RefreshAllTokensHandler implements ICommandHandler<RefreshAllTokensCommand> {
    private readonly logger = new Logger(RefreshAllTokensHandler.name);

    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly configService: ConfigService
    ) {}

    async execute(): Promise<void> {
        this.logger.log('Started RefreshAllTokensHandler command');
        const irecApiUrl = this.configService.get<string>('IREC_API_URL');

        const expiredConnections = await this.repository.find({
            where: {
                expiryDate: LessThan(new Date()),
                active: true
            }
        });

        if (!expiredConnections.length) {
            this.logger.log('Expired IREC connections not found');
            return;
        }

        const results = await Promise.allSettled(
            expiredConnections.map(async (irecConnection) => {
                const accessToken: AccessTokens = {
                    accessToken: irecConnection.accessToken,
                    refreshToken: irecConnection.refreshToken,
                    expiryDate: irecConnection.expiryDate
                };
                const client = new IRECAPIClient(
                    irecApiUrl,
                    irecConnection.clientId,
                    irecConnection.clientSecret,
                    async (accessTokens: AccessTokens) => {
                        await this.repository.update(irecConnection.id, {
                            ...accessTokens,
                            attempts: 0
                        });
                    },
                    accessToken
                );

                await client.organisation.get().catch(async (): Promise<void> => {
                    const disabled = ++irecConnection.attempts >= MAX_ATTEMPTS;
                    this.logger.warn(
                        `Unable to update IREC access tokens for registration ${irecConnection.registration}, ` +
                            `attempt №${irecConnection.attempts} ${
                                disabled ? '. Disabling connection...' : ''
                            }`
                    );
                    await this.repository
                        .update(
                            irecConnection.id,
                            disabled ? { active: false } : { attempts: () => 'attempts + 1' }
                        )
                        .catch(() => {});
                });
            })
        );

        const updated = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        this.logger.log(
            `Update IREC access tokens finished, updated: ${updated}, failed: ${failed}`
        );
    }
}
