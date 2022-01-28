import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';

import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { RevokeCertificationRequestCommand } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { RevokeIrecCertificationRequestCommand } from '../commands';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@CommandHandler(RevokeIrecCertificationRequestCommand)
export class RevokeIrecCertificationRequestHandler
    implements ICommandHandler<RevokeIrecCertificationRequestCommand>
{
    constructor(
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>,
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({
        id,
        organizationId
    }: RevokeIrecCertificationRequestCommand): Promise<ISuccessResponse> {
        const { irecIssueRequestId } = await this.irecRepository.findOne({
            certificationRequestId: id
        });

        const issueRequest = await this.irecService.getIssueRequest(
            organizationId,
            irecIssueRequestId
        );

        const allowedStatuses = [
            IssuanceStatus.InProgress,
            IssuanceStatus.Submitted,
            IssuanceStatus.Verified
        ];

        if (!allowedStatuses.includes(issueRequest.status)) {
            throw new BadRequestException(
                `IREC issuance request have to be in In-progress, Submitted, or Verified state, got ${issueRequest.status}`
            );
        }

        await this.irecService.rejectIssueRequest(organizationId, irecIssueRequestId);
        return this.commandBus.execute(new RevokeCertificationRequestCommand(id));
    }
}
