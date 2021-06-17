import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { BadRequestException } from '@nestjs/common';

import { UserService } from '@energyweb/origin-backend';
import { IrecService } from '../../irec';
import { ApproveIrecCertificationRequestCommand } from '../commands';
import { IrecCertificationRequest } from '../irec-certification-request.entity';
import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { ApproveCertificationRequestCommand } from '@energyweb/issuer-api';

@CommandHandler(ApproveIrecCertificationRequestCommand)
export class ApproveIrecCertificationRequestHandler
    implements ICommandHandler<ApproveIrecCertificationRequestCommand>
{
    constructor(
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>,
        private readonly commandBus: CommandBus,
        private readonly userService: UserService,
        private readonly irecService: IrecService
    ) {}

    async execute({ id }: ApproveIrecCertificationRequestCommand): Promise<ISuccessResponse> {
        const platformAdmin = await this.userService.getPlatformAdmin();
        const { irecIssueRequestId } = await this.irecRepository.findOne({
            certificationRequestId: id
        });

        const issueRequest = await this.irecService.getIssue(platformAdmin.id, irecIssueRequestId);

        if (issueRequest.status === IssuanceStatus.Approved) {
            return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
        }

        if (issueRequest.status !== IssuanceStatus.Verified) {
            throw new BadRequestException('IREC issuance request have to be in VERIFIED state');
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
