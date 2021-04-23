import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
    AccessTokens,
    IRECAPIClient,
    Issue,
    IssueStatus,
    IssueWithStatus
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecCertificateService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }

    private async getIrecClient(user: UserIdentifier | string | number) {
        const irecConnection = await this.commandBus.execute(new GetConnectionCommand(user));

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        const client = new IRECAPIClient(this.configService.get<string>('IREC_API_URL'), {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        });

        client.on('tokensRefreshed', (accessToken: AccessTokens) => {
            this.commandBus.execute(new RefreshTokensCommand(user, accessToken));
        });

        return client;
    }

    async createIrecIssue(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...issue,
                status: IssueStatus.InProgress,
                code: ''
            };
        }
        const irecClient = await this.getIrecClient(user);
        const irecIssue: IssueWithStatus = await irecClient.issue.create(issue);
        await irecClient.issue.submit(irecIssue.code);
        irecIssue.status = IssueStatus.InProgress;
        return irecIssue;
    }

    async update(user: UserIdentifier, code: string, issue: Issue): Promise<IssueWithStatus> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...issue,
                status: IssueStatus.InProgress,
                code
            } as IssueWithStatus;
        }

        const irecClient = await this.getIrecClient(user);
        const irecIssue = await irecClient.issue.get(code);
        if (irecIssue.status === IssueStatus.InProgress) {
            throw new BadRequestException('Issue in "In Progress" state is not available to edit');
        }

        await irecClient.issue.update(code, issue);
        const updatedIredIssue = await irecClient.issue.get(code);
        await irecClient.device.submit(code);
        updatedIredIssue.status = IssueStatus.InProgress;
        return updatedIredIssue;
    }

    async getIssue(user: UserIdentifier, code: string): Promise<IssueWithStatus> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.issue.get(code);
    }
}
