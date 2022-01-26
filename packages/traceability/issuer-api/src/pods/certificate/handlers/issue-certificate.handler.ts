import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Certificate as CertificateFacade } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IssueCertificateCommand } from '../commands/issue-certificate.command';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { UnminedCommitment } from '../unmined-commitment.entity';

@CommandHandler(IssueCertificateCommand)
export class IssueCertificateHandler implements ICommandHandler<IssueCertificateCommand> {
    constructor(
        @InjectRepository(UnminedCommitment)
        private readonly unminedCommitmentRepository: Repository<UnminedCommitment>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        isPrivate,
        metadata
    }: IssueCertificateCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        if (!isPrivate) {
            return await CertificateFacade.create(
                to,
                BigNumber.from(energy),
                fromTime,
                toTime,
                deviceId,
                blockchainProperties,
                metadata
            );
        }

        const { tx, proof } = await CertificateFacade.createPrivate(
            to,
            BigNumber.from(energy),
            fromTime,
            toTime,
            deviceId,
            blockchainProperties,
            metadata
        );

        await this.unminedCommitmentRepository.save({
            txHash: tx.hash.toLowerCase(),
            commitment: proof
        });

        return tx;
    }
}
