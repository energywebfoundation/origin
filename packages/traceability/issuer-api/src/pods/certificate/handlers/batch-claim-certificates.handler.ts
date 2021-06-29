import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { HttpStatus } from '@nestjs/common';
import { BatchClaimCertificatesCommand } from '../commands/batch-claim-certificates.command';
import { Certificate } from '../certificate.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@CommandHandler(BatchClaimCertificatesCommand)
export class BatchClaimCertificatesHandler
    implements ICommandHandler<BatchClaimCertificatesCommand>
{
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        certificateAmounts,
        claimData,
        forAddress
    }: BatchClaimCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        const certificatesToClaim = await this.repository.findByIds(
            certificateAmounts.map((cert) => cert.id),
            { relations: ['blockchain'] }
        );

        const notOwnedCertificates = certificatesToClaim
            .filter(
                (cert) =>
                    !cert.owners[forAddress] ||
                    BigNumber.from(cert.owners[forAddress] ?? 0).isZero()
            )
            .map((cert) => cert.id);

        if (notOwnedCertificates.length > 0) {
            return ResponseFailure(
                `Requested claiming of certificates, but you do not own certificates with IDs: ${notOwnedCertificates.join(
                    ', '
                )}`,
                HttpStatus.FORBIDDEN
            );
        }

        try {
            const batchClaimTx = await CertificateBatchOperations.claimCertificates(
                certificateAmounts.map((cert) => cert.id),
                claimData,
                blockchainProperties.wrap(),
                forAddress,
                certificateAmounts.map((cert) => BigNumber.from(cert.amount))
            );

            const receipt = await batchClaimTx.wait();

            if (receipt.status === 0) {
                throw new Error(
                    `ClaimBatch tx ${
                        receipt.transactionHash
                    } on certificate with id ${certificatesToClaim.map((cert) => cert.id)} failed.`
                );
            }
        } catch (error) {
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
