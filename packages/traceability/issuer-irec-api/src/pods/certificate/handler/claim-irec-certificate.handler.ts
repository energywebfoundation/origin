import { ContractTransaction } from 'ethers';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { ClaimCertificateCommand } from '@energyweb/issuer-api';

import { ClaimIRECCertificateCommand } from '../command';

@CommandHandler(ClaimIRECCertificateCommand)
export class ClaimIRECCertificateHandler implements ICommandHandler<ClaimIRECCertificateCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE) private readonly irecService: IrecService
    ) {}

    async execute({
        user,
        certificateId,
        claimData,
        fromTradeAccount,
        toRedemptionAccount
    }: ClaimIRECCertificateCommand): Promise<ContractTransaction> {
        const redemptionResult = await this.irecService.redeem(
            user,
            certificateId.toString(),
            claimData,
            fromTradeAccount,
            toRedemptionAccount
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
