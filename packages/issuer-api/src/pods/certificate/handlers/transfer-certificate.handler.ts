import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate as CertificateFacade, PreciseProofUtils } from '@energyweb/issuer';
import { BigNumber } from 'ethers';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { BadRequestException } from '@nestjs/common';
import { TransferCertificateCommand } from '../commands/transfer-certificate.command';
import { Certificate } from '../certificate.entity';

@CommandHandler(TransferCertificateCommand)
export class TransferCertificateHandler implements ICommandHandler<TransferCertificateCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({
        certificateId,
        from,
        to,
        amount
    }: TransferCertificateCommand): Promise<ISuccessResponse> {
        const certificate = await this.repository.findOne(
            { id: certificateId },
            { relations: ['blockchain'] }
        );

        const onChainCert = await new CertificateFacade(
            certificate.tokenId,
            certificate.blockchain.wrap()
        ).sync();

        if (certificate.issuedPrivately) {
            const senderBalance = BigNumber.from(
                certificate.latestCommitment.commitment[from] ?? 0
            );
            const receiverBalance = BigNumber.from(
                certificate.latestCommitment.commitment[to] ?? 0
            );
            const amountToTransfer = BigNumber.from(amount);

            if (amountToTransfer > senderBalance) {
                throw new BadRequestException({
                    success: false,
                    message: `Sender ${from} has a balance of ${senderBalance.toString()} but wants to send ${amount}`
                });
            }

            const newSenderBalance = senderBalance.sub(amountToTransfer);
            const newReceiverBalance = receiverBalance.add(amountToTransfer);

            const newCommitment = {
                ...certificate.latestCommitment.commitment,
                [from]: newSenderBalance.toString(),
                [to]: newReceiverBalance.toString()
            };

            await this.repository.update(certificateId, {
                latestCommitment: PreciseProofUtils.generateProofs(newCommitment)
            });

            return {
                success: true
            };
        }

        try {
            await onChainCert.transfer(
                to,
                BigNumber.from(amount ?? onChainCert.owners[from]),
                from
            );
        } catch (error) {
            return {
                success: false,
                message: JSON.stringify(error)
            };
        }

        await certificate.sync();

        return {
            success: true
        };
    }
}
