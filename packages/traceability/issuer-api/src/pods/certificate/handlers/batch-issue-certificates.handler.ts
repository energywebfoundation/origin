import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { HttpStatus, HttpException } from '@nestjs/common';
import { BigNumber, ContractTransaction } from 'ethers';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { BatchIssueCertificatesCommand } from '../commands/batch-issue-certificates.command';

@CommandHandler(BatchIssueCertificatesCommand)
export class BatchIssueCertificatesHandler
    implements ICommandHandler<BatchIssueCertificatesCommand>
{
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({
        certificatesInfo
    }: BatchIssueCertificatesCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        try {
            return CertificateBatchOperations.issueCertificates(
                certificatesInfo.map((info) => ({
                    ...info,
                    generationStartTime: info.fromTime,
                    generationEndTime: info.toTime,
                    amount: BigNumber.from(info.energy),
                    metadata: info.metadata
                })),
                blockchainProperties
            );
        } catch (error) {
            throw new HttpException(JSON.stringify(error), HttpStatus.FAILED_DEPENDENCY);
        }
    }
}
