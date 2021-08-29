import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';

import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { UserService } from '@energyweb/origin-backend';
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
        private readonly userService: UserService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({ id }: RevokeIrecCertificationRequestCommand): Promise<ISuccessResponse> {
        const platformAdmin = await this.userService.getPlatformAdmin();
        const { irecIssueRequestId } = await this.irecRepository.findOne({
            certificationRequestId: id
        });

        const issueRequest = await this.irecService.getIssueRequest(
            platformAdmin.organization.id,
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

        await this.irecService.rejectIssueRequest(
            platformAdmin.organization.id,
            irecIssueRequestId
        );
        return this.commandBus.execute(new RevokeCertificationRequestCommand(id));
    }
}
