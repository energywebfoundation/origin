import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate as CertificateFacade } from '@energyweb/issuer';
import { BigNumber, ContractTransaction, Event as BlockchainEvent, utils } from 'ethers';
import { PreciseProofs } from 'ew-precise-proofs-js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { ClaimCertificateCommand } from '../commands/claim-certificate.command';
import { Certificate } from '../certificate.entity';

@CommandHandler(ClaimCertificateCommand)
export class ClaimCertificateHandler implements ICommandHandler<ClaimCertificateCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        certificateId,
        claimData,
        forAddress,
        amount
    }: ClaimCertificateCommand): Promise<ContractTransaction> {
        const checksummedForAddress = utils.getAddress(forAddress);

        const certificate = await this.repository.findOne(
            { id: certificateId },
            { relations: ['blockchain'] }
        );

        if (!certificate) {
            throw new NotFoundException(
                `Requested claim of certificate ${certificateId}, but such doesn't exist`
            );
        }

        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const cert = await new CertificateFacade(
            certificate.id,
            blockchainProperties,
            certificate.schemaVersion
        ).sync({
            creationTransactionHash: certificate.creationTransactionHash
        });

        const claimerBalance = BigNumber.from(
            (certificate.issuedPrivately
                ? certificate.latestCommitment.commitment
                : certificate.owners)[checksummedForAddress] ?? 0
        );

        const amountToClaim = amount ? BigNumber.from(amount) : claimerBalance;

        if (amountToClaim.gt(claimerBalance)) {
            throw new BadRequestException(
                `Claimer ${checksummedForAddress} has a balance of ${claimerBalance.toString()} but wants to claim ${amountToClaim}.`
            );
        }

        // Transfer private certificates to public
        if (certificate.issuedPrivately) {
            const { activeUser, privateIssuer } = blockchainProperties;
            const privateIssuerWithSigner = privateIssuer.connect(activeUser);

            const ownerAddressLeafHash = certificate.latestCommitment.leafs.find(
                (leaf) => leaf.key === checksummedForAddress
            ).hash;

            const requestTx = await privateIssuerWithSigner.requestMigrateToPublicFor(
                certificate.id,
                ownerAddressLeafHash,
                checksummedForAddress
            );
            const { events } = await requestTx.wait();

            const getIdFromEvents = (logs: BlockchainEvent[]): number =>
                Number(logs.find((log) => log.event === 'MigrateToPublicRequested').topics[2]);

            const requestId = getIdFromEvents(events);

            const theProof = PreciseProofs.createProof(
                checksummedForAddress,
                certificate.latestCommitment.leafs,
                false
            );
            const onChainProof = theProof.proofPath.map((p) => ({
                left: !!p.left,
                hash: p.left || p.right
            }));

            const { salt } = theProof;

            const migrateTx = await privateIssuerWithSigner.migrateToPublic(
                requestId.toString(),
                amountToClaim.toString(),
                salt,
                onChainProof
            );
            await migrateTx.wait();
        }

        return await cert.claim(
            claimData,
            BigNumber.from(amountToClaim),
            checksummedForAddress,
            checksummedForAddress
        );
    }
}
