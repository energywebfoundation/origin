import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { HttpStatus } from '@nestjs/common';
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

    async execute({ transfers }: BatchTransferCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        for (const { id, amount, from } of transfers) {
            if (!amount) {
                continue;
            }

            const cert = await this.repository.findOne(id);

            if (
                !cert.owners[from] ||
                BigNumber.from(cert.owners[from] ?? 0).isZero() ||
                BigNumber.from(cert.owners[from] ?? 0).lt(amount)
            ) {
                return ResponseFailure(
                    `Requested transferring of certificate ${id} with amount ${amount.toString()}, but you only own ${
                        cert.owners[from] ?? 0
                    }`,
                    HttpStatus.FORBIDDEN
                );
            }
        }

        try {
            const batchTransferTx = await CertificateBatchOperations.transferCertificates(
                transfers,
                blockchainProperties.wrap()
            );

            const receipt = await batchTransferTx.wait();

            if (receipt.status === 0) {
                throw new Error(
                    `ClaimBatch tx ${
                        receipt.transactionHash
                    } on certificate with id ${transfers.map((transfer) => transfer.id)} failed.`
                );
            }
        } catch (error) {
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
