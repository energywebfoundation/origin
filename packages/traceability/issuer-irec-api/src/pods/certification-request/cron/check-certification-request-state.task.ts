import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

import { UserService } from '@energyweb/origin-backend';
import {
    ApproveCertificationRequestCommand,
    GetAllCertificationRequestsQuery,
    RevokeCertificationRequestCommand
} from '@energyweb/issuer-api';
import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { CertificationRequestStatusChangedEvent } from '../events';
import { InjectRepository } from '@nestjs/typeorm';
import { IrecCertificationRequest } from '../irec-certification-request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CheckCertificationRequestStateTask {
    private readonly logger = new Logger(CheckCertificationRequestStateTask.name);

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly userService: UserService,
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const certificationRequests = await this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ approved: false })
        );

        for (const certificateRequest of certificationRequests) {
            try {
                const user = await this.userService.findOne(certificateRequest.userId);
                const irecIssue = await this.irecService.getIssueRequest(
                    user.organization.id,
                    certificateRequest.irecIssueRequestId
                );

                if (!irecIssue) {
                    return;
                }

                if (
                    irecIssue.status === IssuanceStatus.Approved ||
                    irecIssue.status === IssuanceStatus.Issued
                ) {
                    await this.irecRepository.update(
                        { irecIssueRequestId: certificateRequest.irecIssueRequestId },
                        { irecAssetId: irecIssue.asset }
                    );
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
                if (irecIssue.status === IssuanceStatus.Rejected) {
                    await this.commandBus.execute(
                        new RevokeCertificationRequestCommand(certificateRequest.id)
                    );
                }
            } catch (e) {
                this.logger.error(
                    `Cannot check IREC certification request (${certificateRequest.irecIssueRequestId}) state because of error: ${e.message}`
                );
            }
        }
    }
}
