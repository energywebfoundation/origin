import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';

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

    async execute({ claims }: BatchClaimCertificatesCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        if (claims.length === 0) {
            throw new BadRequestException('Cannot process empty claims request');
        }

        for (const { id, amount, from } of claims) {
            if (!amount) {
                continue;
            }

            const cert = await this.repository.findOne(id);

            if (!cert) {
                throw new NotFoundException(
                    `Requested claim of certificate ${id}, but such doesn't exist`
                );
            }

            if (
                !cert.owners[from] ||
                BigNumber.from(cert.owners[from] ?? 0).isZero() ||
                BigNumber.from(cert.owners[from] ?? 0).lt(amount)
            ) {
                throw new ForbiddenException(
                    `Requested claiming of certificate ${id} with amount ${amount.toString()}, but you only own ${
                        cert.owners[from] ?? 0
                    }`
                );
            }
        }

        try {
            return await CertificateBatchOperations.claimCertificates(
                claims,
                blockchainProperties.wrap()
            );
        } catch (error) {
            throw new HttpException(JSON.stringify(error), HttpStatus.FAILED_DEPENDENCY);
        }
    }
}
