import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { HttpStatus, HttpException } from '@nestjs/common';
import { BigNumber } from 'ethers';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { BatchIssueCertificatesCommand } from '../commands/batch-issue-certificates.command';
import { Certificate } from '../certificate.entity';

@CommandHandler(BatchIssueCertificatesCommand)
export class BatchIssueCertificatesHandler
    implements ICommandHandler<BatchIssueCertificatesCommand>
{
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({
        certificatesInfo
    }: BatchIssueCertificatesCommand): Promise<Certificate['id'][]> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        try {
            return CertificateBatchOperations.issueCertificates(
                certificatesInfo.map((info) => ({
                    ...info,
                    generationStartTime: info.fromTime,
                    generationEndTime: info.toTime,
                    amount: BigNumber.from(info.energy),
                    metadata: info.metadata
                })),
                blockchainProperties.wrap()
            );
        } catch (error) {
            throw new HttpException(JSON.stringify(error), HttpStatus.FAILED_DEPENDENCY);
        }
    }
}
