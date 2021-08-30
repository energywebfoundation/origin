import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';

import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { UserService } from '@energyweb/origin-backend';
import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { ApproveCertificationRequestCommand } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { ApproveIrecCertificationRequestCommand } from '../commands';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@CommandHandler(ApproveIrecCertificationRequestCommand)
export class ApproveIrecCertificationRequestHandler
    implements ICommandHandler<ApproveIrecCertificationRequestCommand>
{
    constructor(
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>,
        private readonly commandBus: CommandBus,
        private readonly userService: UserService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({ id }: ApproveIrecCertificationRequestCommand): Promise<ISuccessResponse> {
        const platformAdmin = await this.userService.getPlatformAdmin();
        const { irecIssueRequestId } = await this.irecRepository.findOne({
            certificationRequestId: id
        });

        const issueRequest = await this.irecService.getIssueRequest(
            platformAdmin.organization.id,
            irecIssueRequestId
        );

        const allowedStatuses = [
            IssuanceStatus.Approved,
            IssuanceStatus.Submitted,
            IssuanceStatus.InProgress,
            IssuanceStatus.Verified
        ];

        if (!allowedStatuses.includes(issueRequest.status)) {
            throw new BadRequestException(
                `IREC issuance request have to be in In-progress, Submitted, Verified, or Approved state, got ${issueRequest.status}`
            );
        }

        if (issueRequest.status === IssuanceStatus.Approved) {
            return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
        }

        const inProgressStatuses = [IssuanceStatus.Submitted, IssuanceStatus.InProgress];
        if (inProgressStatuses.includes(issueRequest.status)) {
            await this.irecService.verifyIssueRequest(
                platformAdmin.organization.id,
                irecIssueRequestId
            );
        }

        const issueAccountCode = await this.irecService.getIssueAccountCode(
            platformAdmin.organization.id
        );
        const transaction = await this.irecService.approveIssueRequest(
            platformAdmin.organization.id,
            irecIssueRequestId,
            issueAccountCode
        );

        await this.irecRepository.update(id, { irecAssetId: transaction.asset });

        return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
    }
}
