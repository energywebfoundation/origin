import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate as CertificateFacade, PreciseProofUtils } from '@energyweb/issuer';
import { BigNumber } from 'ethers';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus } from '@nestjs/common';
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
            certificate.id,
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
                return ResponseFailure(
                    `Sender ${from} has a balance of ${senderBalance.toString()} but wants to send ${amount}`,
                    HttpStatus.BAD_REQUEST
                );
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

            return ResponseSuccess();
        }

        try {
            const transferTx = await onChainCert.transfer(
                to,
                BigNumber.from(amount ?? onChainCert.owners[from]),
                from
            );

            const receipt = await transferTx.wait();

            if (receipt.status === 0) {
                throw new Error(
                    `Transfer tx ${receipt.transactionHash} on certificate with id ${onChainCert.id} failed.`
                );
            }
        } catch (error) {
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
