import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificateBatchOperations } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus } from '@nestjs/common';
import { BigNumber } from 'ethers';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { BatchIssueCertificatesCommand } from '../commands/batch-issue-certificates.command';

@CommandHandler(BatchIssueCertificatesCommand)
export class BatchIssueCertificatesHandler
    implements ICommandHandler<BatchIssueCertificatesCommand>
{
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({ certificatesInfo }: BatchIssueCertificatesCommand): Promise<ISuccessResponse> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        try {
            await CertificateBatchOperations.issueCertificates(
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
            return ResponseFailure(JSON.stringify(error), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseSuccess();
    }
}
