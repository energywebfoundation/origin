import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate as CertificateFacade } from '@energyweb/issuer';
import { BigNumber, Event as BlockchainEvent, utils } from 'ethers';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { PreciseProofs } from 'precise-proofs-js';
import { ClaimCertificateCommand } from '../commands/claim-certificate.command';
import { Certificate } from '../certificate.entity';

@CommandHandler(ClaimCertificateCommand)
export class ClaimCertificateHandler implements ICommandHandler<ClaimCertificateCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({
        certificateId,
        claimData,
        forAddress,
        amount
    }: ClaimCertificateCommand): Promise<ISuccessResponse> {
        const checksummedForAddress = utils.getAddress(forAddress);

        const certificate = await this.repository.findOne(
            { id: certificateId },
            { relations: ['blockchain'] }
        );

        const cert = await new CertificateFacade(
            certificate.tokenId,
            certificate.blockchain.wrap()
        ).sync();

        const claimerBalance = BigNumber.from(
            (certificate.issuedPrivately
                ? certificate.latestCommitment.commitment
                : certificate.owners)[checksummedForAddress] ?? 0
        );

        const amountToClaim = amount ? BigNumber.from(amount) : claimerBalance;

        if (amountToClaim > claimerBalance) {
            return ResponseFailure(
                `Claimer ${checksummedForAddress} has a balance of ${claimerBalance.toString()} but wants to claim ${amount}.`
            );
        }

        // Transfer private certificates to public
        if (certificate.issuedPrivately) {
            const { activeUser, issuer } = certificate.blockchain.wrap();
            const issuerWithSigner = issuer.connect(activeUser);

            const ownerAddressLeafHash = certificate.latestCommitment.leafs.find(
                (leaf) => leaf.key === checksummedForAddress
            ).hash;

            const requestTx = await issuerWithSigner.requestMigrateToPublicFor(
                certificate.tokenId,
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

            const migrateTx = await issuerWithSigner.migrateToPublic(
                requestId.toString(),
                amountToClaim.toString(),
                salt,
                onChainProof
            );
            await migrateTx.wait();
        }

        try {
            await cert.claim(
                claimData,
                BigNumber.from(amountToClaim),
                checksummedForAddress,
                checksummedForAddress
            );
        } catch (error) {
            return ResponseFailure(JSON.stringify(error));
        }

        await certificate.sync();

        return ResponseSuccess();
    }
}
