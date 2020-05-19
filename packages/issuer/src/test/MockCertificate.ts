import { ContractTransaction } from 'ethers';
import { Configuration } from '@energyweb/utils-general';
import { PreciseProofs } from 'precise-proofs-js';
import { IOwnershipCommitmentProofWithTx } from '@energyweb/origin-backend-core';
import { CertificateClientMock } from '@energyweb/origin-backend-client-mocks';
import { Registry } from '../ethers/Registry';
import { Issuer } from '../ethers/Issuer';
import { Certificate } from '../blockchain-facade/Certificate';

/*
 *  Extended certificate that is only used in tests
 */
export class MockCertificate extends Certificate {
    async migrateToPublic(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const migrationRequestId = await issuerWithSigner.getMigrationRequestId(this.id);
        const migrationRequest = await issuerWithSigner.getMigrationRequest(migrationRequestId);

        const requestor = migrationRequest.owner;
        const privateVolume = this.privateOwnershipCommitment[requestor];

        if (privateVolume.eq(0)) {
            throw new Error(
                `migrateToPublic(): Requestor doesn't own any private volume in certificate #${this.id}.`
            );
        }

        const { salts } = await this.getCommitment();

        const calculatedOffChainStorageProperties = this.generateAndAddProofs(
            this.privateOwnershipCommitment,
            salts
        );

        const theProof = PreciseProofs.createProof(
            requestor,
            calculatedOffChainStorageProperties.leafs,
            false
        );
        const onChainProof = theProof.proofPath.map((p) => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        const { salt } = theProof;
        const tx = await issuerWithSigner.migrateToPublic(
            migrationRequestId,
            privateVolume,
            salt,
            onChainProof
        );
        await tx.wait();

        return tx;
    }

    async approvePrivateTransfer(
        newCommitmentProof: IOwnershipCommitmentProofWithTx
    ): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const previousCommitment = this.propertiesDocumentHash;
        const request = await issuerWithSigner.getPrivateTransferRequest(this.id);

        if (!request) {
            throw new Error(`approvePrivateTransfer(): no pending requests to approve.`);
        }

        const theProof = PreciseProofs.createProof(request.owner, newCommitmentProof.leafs, false);

        const onChainProof = theProof.proofPath.map((p) => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        this.propertiesDocumentHash = newCommitmentProof.rootHash;

        const tx = await issuerWithSigner.approvePrivateTransfer(
            this.id,
            onChainProof,
            previousCommitment,
            newCommitmentProof.rootHash
        );

        await tx.wait();
        await (this.certificateClient as CertificateClientMock).approvePendingOwnershipCommitment(
            this.id
        );

        return tx;
    }
}
