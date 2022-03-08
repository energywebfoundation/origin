import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

import { BatchTransferCertificatesCommand } from '../commands/batch-transfer-certificates.command';
import { Certificate } from '../certificate.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@CommandHandler(BatchTransferCertificatesCommand)
export class BatchTransferCertificatesHandler
    implements ICommandHandler<BatchTransferCertificatesCommand>
{
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({ transfers }: BatchTransferCertificatesCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const certificates = await this.repository.findByIds(transfers.map((c) => c.id));

        const validatedTransfers = transfers.map((transfer) => {
            const { id, amount, from } = transfer;

            const cert = certificates.find((c) => c.id === id);

            if (!cert) {
                throw new NotFoundException(
                    `Requested transfer of certificate ${id}, but such doesn't exist`
                );
            }

            if (
                amount &&
                (!cert.owners[from] ||
                    BigNumber.from(cert.owners[from] ?? 0).isZero() ||
                    BigNumber.from(cert.owners[from] ?? 0).lt(amount))
            ) {
                throw new ForbiddenException(
                    `Requested transferring of certificate ${id} with amount ${amount.toString()}, but you only own ${
                        cert.owners[from] ?? 0
                    }`
                );
            }

            return {
                ...transfer,
                creationTransactionHash: cert.creationTransactionHash,
                schemaVersion: cert.schemaVersion
            };
        });

        try {
            return await CertificateBatchOperations.transferCertificates(
                validatedTransfers,
                blockchainProperties
            );
        } catch (error) {
            throw new HttpException(JSON.stringify(error), HttpStatus.FAILED_DEPENDENCY);
        }
    }
}
