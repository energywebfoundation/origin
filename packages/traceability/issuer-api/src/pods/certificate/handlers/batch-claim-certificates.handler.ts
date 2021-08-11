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

    async execute({ claims }: BatchClaimCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        for (const { id, amount, from } of claims) {
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
                    `Requested claiming of certificate ${id} with amount ${amount.toString()}, but you only own ${
                        cert.owners[from] ?? 0
                    }`,
                    HttpStatus.FORBIDDEN
                );
            }
        }

        try {
            const batchClaimTx = await CertificateBatchOperations.claimCertificates(
                claims,
                blockchainProperties.wrap()
            );

            const receipt = await batchClaimTx.wait();

            if (receipt.status === 0) {
                throw new Error(
                    `ClaimBatch tx ${receipt.transactionHash} on certificate with id ${claims.map(
                        (claim) => claim.id
                    )} failed.`
                );
            }
        } catch (error) {
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
