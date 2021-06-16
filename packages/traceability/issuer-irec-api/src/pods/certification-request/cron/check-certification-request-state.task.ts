import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { IrecService } from '../../irec';
import {
    ApproveCertificationRequestCommand,
    GetAllCertificationRequestsQuery
} from '@energyweb/issuer-api';
import { CertificationRequestStatusChangedEvent } from '../events';

@Injectable()
export class CheckCertificationRequestStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly irecService: IrecService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (!this.irecService.isIrecIntegrationEnabled()) {
            return;
        }

        const certificateRequests = await this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ approved: false })
        );

        for (const certificateRequest of certificateRequests) {
            const irecIssue = await this.irecService.getIssue(
                certificateRequest.userId,
                certificateRequest.irecIssueId
            );

            if (irecIssue.status === IssuanceStatus.Approved) {
                await this.commandBus.execute(
                    new ApproveCertificationRequestCommand(certificateRequest.id)
                );
                this.eventBus.publish(
                    new CertificationRequestStatusChangedEvent(
                        certificateRequest,
                        IssuanceStatus.Approved
                    )
                );
            }
        }
    }
}
