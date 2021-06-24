import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import {
    CertificationRequestStatusChangedEvent,
    GetAllCertificationRequestsQuery,
    ApproveCertificationRequestCommand
} from '@energyweb/issuer-irec-api';
import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

@Injectable()
export class CheckCertificationRequestStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const certificationRequests = await this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ approved: false })
        );

        for (const certificateRequest of certificationRequests) {
            const irecIssue = await this.irecService.getIssueRequest(
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
