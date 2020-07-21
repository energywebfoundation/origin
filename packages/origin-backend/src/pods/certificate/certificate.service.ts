import { ethers } from 'ethers';
import {
    Injectable,
    NotFoundException,
    Logger,
    ConflictException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import {
    ICertificateOwnership,
    IOwnershipCommitmentProofWithTx,
    CommitmentStatus,
    IOwnershipCommitment,
    IOwnershipCommitmentProof,
    ILoggedInUser
} from '@energyweb/origin-backend-core';
import { Contracts } from '@energyweb/issuer';
import { ConfigService } from '@nestjs/config';
import { getProviderWithFallback } from '@energyweb/utils-general';

import { PreciseProofs } from 'precise-proofs-js';
import { ConfigurationService } from '../configuration/configuration.service';
import { Certificate } from './certificate.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { OwnershipCommitment } from './ownership-commitment.entity';

@Injectable()
export class CertificateService {
    private readonly logger = new Logger(CertificateService.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        @InjectRepository(OwnershipCommitment)
        private readonly ownershipCommitmentRepository: Repository<OwnershipCommitment>,
        private readonly configurationService: ConfigurationService,
        private readonly configService: ConfigService
    ) {}

    async create(cert: DeepPartial<Certificate>) {
        const certificate = this.repository.create(cert);

        return this.repository.save(certificate);
    }

    async get(id: number): Promise<ICertificateOwnership> {
        return this.repository.findOne(id, {
            relations: ['currentOwnershipCommitment', 'pendingOwnershipCommitment']
        });
    }

    async getOwnershipCommitment(id: number): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.repository.findOne(id);

        if (!certificate?.currentOwnershipCommitment) {
            throw new NotFoundException(`getOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate.currentOwnershipCommitment;
    }

    async approvePendingOwnershipCommitment(id: number): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.repository.findOne(id);

        if (!certificate?.pendingOwnershipCommitment) {
            throw new NotFoundException(
                `approvePendingOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`
            );
        }

        certificate.ownershipHistory.push(certificate.currentOwnershipCommitment);
        certificate.currentOwnershipCommitment = certificate.pendingOwnershipCommitment;
        certificate.pendingOwnershipCommitment = null;

        await this.repository.save(certificate);

        return certificate.currentOwnershipCommitment;
    }

    async addOwnershipCommitment(
        id: number,
        proof: IOwnershipCommitmentProofWithTx,
        user: ILoggedInUser
    ) {
        const certificate = await this.repository.findOne(id);

        if (!certificate) {
            throw new NotFoundException(
                `Tried adding a commitment for certificate with ID "${id}". ${StorageErrors.NON_EXISTENT}.`
            );
        }

        if (user.blockchainAccountAddress !== certificate.originalRequestor) {
            throw new UnauthorizedException(
                `Not the original requestor of certificate with ID "${id}".`
            );
        }

        const { currentOwnershipCommitment, pendingOwnershipCommitment } = certificate;

        const newCommitment = new OwnershipCommitment();

        Object.assign(newCommitment, { ...proof });

        if (!currentOwnershipCommitment) {
            await this.ownershipCommitmentRepository.save(newCommitment);
            certificate.currentOwnershipCommitment = newCommitment;

            await this.repository.save(certificate);

            return {
                commitmentStatus: CommitmentStatus.CURRENT,
                message: `Commitment ${proof.rootHash} saved as the current commitment for certificate #${id}`
            };
        }

        if (currentOwnershipCommitment && !pendingOwnershipCommitment) {
            const isCurrentOwner = currentOwnershipCommitment.commitment[
                user.blockchainAccountAddress
            ].gt(0);

            if (!isCurrentOwner) {
                throw new UnauthorizedException(`Not an owner in certificate.`);
            }

            await this.ownershipCommitmentRepository.save(newCommitment);
            certificate.pendingOwnershipCommitment = newCommitment;

            await this.repository.save(certificate);

            return {
                commitmentStatus: CommitmentStatus.PENDING,
                message: `Commitment ${proof.rootHash} saved as a pending commitment for certificate #${id}`
            };
        }

        throw new ConflictException({
            commitmentStatus: CommitmentStatus.REJECTED,
            message: `Unable to add a new commitment to certificate #${id}. There is already a pending commitment in the queue.`
        });
    }

    async migrateToPublic(certificateId: number): Promise<ethers.Transaction> {
        const certificate = await this.get(certificateId);

        const {
            contractsLookup: { issuer: issuerContractAddress }
        } = await this.configurationService.get();

        try {
            ethers.utils.getAddress(issuerContractAddress);
        } catch (e) {
            this.logger.error(
                `Issuer address "${issuerContractAddress}" is not a contract address. Unable to initialize.`
            );
            return;
        }

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        const provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        const backendWallet = new ethers.Wallet(this.configService.get<string>('DEPLOY_KEY'));

        const issuer = new ethers.Contract(
            issuerContractAddress,
            Contracts.IssuerJSON.abi,
            provider
        );
        const issuerWithSigner = issuer.connect(backendWallet);

        const migrationRequestId = await issuerWithSigner.getMigrationRequestId(certificateId);
        const migrationRequest = await issuerWithSigner.getMigrationRequest(migrationRequestId);

        const requestor = migrationRequest.owner;
        const { commitment: currentCommitment, salts } = certificate.currentOwnershipCommitment;
        const privateVolume = certificate.currentOwnershipCommitment.commitment[requestor];

        if (privateVolume.eq(0)) {
            throw new Error(
                `migrateToPublic(): Requestor doesn't own any private volume in certificate #${certificateId}.`
            );
        }

        const calculatedOffChainStorageProperties = this.proofFromCommitment(
            currentCommitment,
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
    }

    async approvePrivateTransfer(certificateId: number): Promise<ethers.Transaction> {
        const certificate = await this.get(certificateId);

        const {
            contractsLookup: { issuer: issuerContractAddress }
        } = await this.configurationService.get();

        try {
            ethers.utils.getAddress(issuerContractAddress);
        } catch (e) {
            this.logger.error(
                `Issuer address "${issuerContractAddress}" is not a contract address. Unable to initialize.`
            );
            return;
        }

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        const provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        const backendWallet = new ethers.Wallet(this.configService.get<string>('DEPLOY_KEY'));

        const issuer = new ethers.Contract(
            issuerContractAddress,
            Contracts.IssuerJSON.abi,
            provider
        );
        const issuerWithSigner = issuer.connect(backendWallet);

        const { commitment: previousCommitment } = certificate.currentOwnershipCommitment;

        const newCommitmentProof = certificate.pendingOwnershipCommitment;
        const request = await issuerWithSigner.getPrivateTransferRequest(certificateId);

        if (!request) {
            throw new Error(`approvePrivateTransfer(): no pending requests to approve.`);
        }

        const theProof = PreciseProofs.createProof(request.owner, newCommitmentProof.leafs, false);

        const onChainProof = theProof.proofPath.map((p) => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        const tx = await issuerWithSigner.approvePrivateTransfer(
            certificateId,
            onChainProof,
            previousCommitment,
            newCommitmentProof.rootHash
        );

        await tx.wait();
        await this.approvePendingOwnershipCommitment(certificateId);
    }

    private proofFromCommitment(
        commitment: IOwnershipCommitment,
        salts?: string[]
    ): IOwnershipCommitmentProof {
        let leafs = salts
            ? PreciseProofs.createLeafs(commitment, salts)
            : PreciseProofs.createLeafs(commitment);

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(
            leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash)
        );

        return {
            commitment,
            rootHash: PreciseProofs.getRootHash(merkleTree),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            leafs
        };
    }
}
