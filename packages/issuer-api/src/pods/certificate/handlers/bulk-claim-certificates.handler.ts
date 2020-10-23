import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateUtils } from '@energyweb/issuer';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { BadRequestException } from '@nestjs/common';
import { BulkClaimCertificatesCommand } from '../commands/bulk-claim-certificates.command';
import { Certificate } from '../certificate.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@CommandHandler(BulkClaimCertificatesCommand)
export class BulkClaimCertificatesHandler implements ICommandHandler<BulkClaimCertificatesCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        certificateIds,
        claimData,
        forAddress
    }: BulkClaimCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        const allCertificates = await this.repository.find({ relations: ['blockchain'] });
        const certificatesToClaim = allCertificates.filter((cert) =>
            certificateIds.includes(cert.id)
        );

        if (
            !certificatesToClaim.every(
                (cert) => cert.owners[forAddress] && BigNumber.from(cert.owners[forAddress]).gt(0)
            )
        ) {
            throw new BadRequestException({
                success: false,
                message: 'You have requested claiming of a certificate you do not own'
            });
        }

        try {
            await CertificateUtils.claimCertificates(
                certificatesToClaim.map((cert) => cert.tokenId),
                claimData,
                blockchainProperties.wrap(),
                forAddress
            );
        } catch (error) {
            return {
                success: false,
                message: JSON.stringify(error)
            };
        }

        for (const cert of certificatesToClaim) {
            await cert.sync();
        }

        return {
            success: true
        };
    }
}
