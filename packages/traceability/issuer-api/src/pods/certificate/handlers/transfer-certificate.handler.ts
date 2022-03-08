import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate as CertificateFacade, PreciseProofUtils } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransferCertificateCommand } from '../commands/transfer-certificate.command';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';

@CommandHandler(TransferCertificateCommand)
export class TransferCertificateHandler implements ICommandHandler<TransferCertificateCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        certificateId,
        from,
        to,
        amount
    }: TransferCertificateCommand): Promise<ContractTransaction | true> {
        const certificate = await this.repository.findOne(
            { id: certificateId },
            { relations: ['blockchain'] }
        );

        if (!certificate) {
            throw new NotFoundException(
                `Requested transfer of certificate ${certificateId}, but such doesn't exist`
            );
        }

        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const onChainCert = await new CertificateFacade(
            certificate.id,
            blockchainProperties,
            certificate.schemaVersion
        ).sync({
            creationTransactionHash: certificate.creationTransactionHash,
        });

        if (certificate.issuedPrivately) {
            const senderBalance = BigNumber.from(
                certificate.latestCommitment.commitment[from] ?? 0
            );
            const receiverBalance = BigNumber.from(
                certificate.latestCommitment.commitment[to] ?? 0
            );
            const amountToTransfer = BigNumber.from(amount);

            if (amountToTransfer > senderBalance) {
                throw new BadRequestException(
                    `Sender ${from} has a balance of ${senderBalance.toString()} but wants to send ${amount}`
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

            return true;
        }

        return await onChainCert.transfer(
            to,
            BigNumber.from(amount ?? onChainCert.owners[from]),
            from
        );
    }
}
