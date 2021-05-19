import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import {
    IrecCertificateService,
    CertificationRequestStatusChangedEvent,
    GetAllCertificationRequestsQuery,
    ApproveCertificationRequestCommand
} from '@energyweb/issuer-irec-api';
import { IssueStatus } from '@energyweb/issuer-irec-api-wrapper';

@Injectable()
export class CheckCertificateStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly irecCertificateService: IrecCertificateService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (!this.irecCertificateService.isIrecIntegrationEnabled()) {
            return;
        }

        const certificateRequests = await this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ approved: false })
        );

        for (const certificateRequest of certificateRequests) {
            const irecIssue = await this.irecCertificateService.getIssue(
                certificateRequest.userId,
                certificateRequest.irecIssueId
            );

            if (irecIssue.status === IssueStatus.Approved) {
                await this.commandBus.execute(
                    new ApproveCertificationRequestCommand(certificateRequest.id)
                );
                this.eventBus.publish(
                    new CertificationRequestStatusChangedEvent(
                        certificateRequest,
                        IssueStatus.Approved
                    )
                );
            }
        }
    }
}
