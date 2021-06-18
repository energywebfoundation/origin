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

    async execute({
        certificateIds,
        to,
        values,
        forAddress
    }: BatchTransferCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        const certificatesToTransfer = await this.repository.findByIds(certificateIds, {
            relations: ['blockchain']
        });

        if (
            !certificatesToTransfer.every(
                (cert) => cert.owners[forAddress] && BigNumber.from(cert.owners[forAddress]).gt(0)
            )
        ) {
            return ResponseSuccess('You have requested claiming of a certificate you do not own');
        }

        try {
            const batchTransferTx = await CertificateBatchOperations.transferCertificates(
                certificateIds,
                to,
                blockchainProperties.wrap(),
                forAddress,
                values
            );

            const receipt = await batchTransferTx.wait();

            if (receipt.status === 0) {
                throw new Error(
                    `ClaimBatch tx ${
                        receipt.transactionHash
                    } on certificate with id ${certificatesToTransfer.map(
                        (cert) => cert.id
                    )} failed.`
                );
            }
        } catch (error) {
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
