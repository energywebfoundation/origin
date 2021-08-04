import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { ClaimCertificateCommand } from '@energyweb/issuer-api';
import { ClaimIRECCertificateCommand } from '../command/claim-irec-certificate.command';

@CommandHandler(ClaimIRECCertificateCommand)
export class ClaimIRECCertificateHandler implements ICommandHandler<ClaimIRECCertificateCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE) private readonly irecService: IrecService
    ) {}

    async execute({
        user,
        certificateId,
        claimData
    }: ClaimIRECCertificateCommand): Promise<ISuccessResponse> {
        const redemptionResult = await this.irecService.redeem(
            user,
            certificateId.toString(),
            claimData
        );

        if (!redemptionResult) {
            throw new InternalServerErrorException(
                `IREC API refuses to redeem/claim certificate ${certificateId}`
            );
        }

        return await this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, claimData, user.blockchainAccountAddress)
        );
    }
}
