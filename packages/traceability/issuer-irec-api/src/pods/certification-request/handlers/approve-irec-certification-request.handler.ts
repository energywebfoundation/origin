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
            platformAdmin.id,
            irecIssueRequestId
        );

        const allowedStatuses = [
            IssuanceStatus.Approved,
            IssuanceStatus.InProgress,
            IssuanceStatus.Verified
        ];

        if (!allowedStatuses.includes(issueRequest.status)) {
            throw new BadRequestException(
                `IREC issuance request have to be in IN-PROGRESS, VERIFIED, or APPROVED state, got ${issueRequest.status}`
            );
        }

        if (issueRequest.status === IssuanceStatus.Approved) {
            return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
        }

        if (issueRequest.status === IssuanceStatus.InProgress) {
            await this.irecService.verifyIssueRequest(platformAdmin.id, irecIssueRequestId);
        }

        const issueAccountCode = await this.irecService.getIssueAccountCode(platformAdmin.id);
        const transaction = await this.irecService.approveIssueRequest(
            platformAdmin.id,
            irecIssueRequestId,
            issueAccountCode
        );

        await this.irecRepository.update(id, { irecCertificateId: transaction.code });

        return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
    }
}
