import { ethers, Event as BlockchainEvent, BigNumber } from 'ethers';
import polly from 'polly-js';

import { Configuration, Timestamp } from '@energyweb/utils-general';
import {
    ICertificationRequest,
    IOwnershipCommitment,
    MAX_ENERGY_PER_CERTIFICATE
} from '@energyweb/origin-backend-core';

import { PreciseProofEntity } from './PreciseProofEntity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';

export class CertificationRequest extends PreciseProofEntity implements ICertificationRequest {
    owner: string;

    fromTime: Timestamp;

    toTime: Timestamp;

    deviceId: string;

    approved: boolean;

    approvedDate: Date;

    revoked: boolean;

    revokedDate: Date;

    created: Timestamp;

    files: string[];

    energy: BigNumber;

    constructor(
        certData: ICertificationRequest,
        configuration: Configuration.Entity,
        public isPrivate: boolean = false
    ) {
        super(certData.id, configuration);

        Object.assign(this, certData);
    }

    public static async create(
        fromTime: Timestamp,
        toTime: Timestamp,
        energy: BigNumber,
        deviceId: string,
        configuration: Configuration.Entity,
        files: string[],
        isVolumePrivate = false,
        forAddress?: string,
        callback?: (id: CertificationRequest['id']) => void
    ): Promise<CertificationRequest> {
        if (energy.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${energy}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const { certificationRequestClient } = configuration.offChainDataSource;

        const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
            Registry,
            Issuer
        >;
        const issuerWithSigner = issuer.connect(configuration.blockchainProperties.activeUser);

        await certificationRequestClient.validateGenerationPeriod({ fromTime, toTime, deviceId });

        const success = await certificationRequestClient.queueCertificationRequestData({
            deviceId,
            fromTime,
            toTime,
            energy,
            files
        });

        if (!success) {
            throw new Error('Unable to create CertificationRequest');
        }

        const data = await issuer.encodeData(fromTime, toTime, deviceId);

        const tx = await (forAddress
            ? issuerWithSigner.requestCertificationFor(data, forAddress, isVolumePrivate)
            : issuerWithSigner.requestCertification(data, isVolumePrivate));

        const {
            events: [certificationRequested]
        } = await tx.wait();

        const log = issuer.interface.decodeEventLog(
            certificationRequested.event,
            certificationRequested.data,
            certificationRequested.topics
        );

        const id = log._id.toNumber();

        if (configuration.logger) {
            configuration.logger.info(`CertificationRequest ${id} created.`);
        }

        if (callback) {
            callback(id);
        }

        return CertificationRequest.fetch(id, configuration);
    }

    public static async getAll(
        configuration: Configuration.Entity
    ): Promise<CertificationRequest[]> {
        const all = await configuration.offChainDataSource.certificationRequestClient.getAllCertificationRequests();

        return all.map(
            (certReq: ICertificationRequest) => new CertificationRequest(certReq, configuration)
        );
    }

    public static async fetch(
        id: ICertificationRequest['id'],
        configuration: Configuration.Entity
    ): Promise<CertificationRequest> {
        const certData: ICertificationRequest = await polly()
            .waitAndRetry([2000, 4000, 8000, 16000])
            .executeForPromise(() =>
                configuration.offChainDataSource.certificationRequestClient.getCertificationRequest(
                    id
                )
            );

        if (configuration.logger) {
            configuration.logger.verbose(`CertificationRequest ${id} fetched.`);
        }

        return new CertificationRequest(certData, configuration);
    }

    public async sync(): Promise<CertificationRequest> {
        return CertificationRequest.fetch(this.id, this.configuration);
    }

    async approve(): Promise<number> {
        let approveTx;
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const validityData = issuer.interface.encodeFunctionData('isRequestValid', [
            this.id.toString()
        ]);

        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        if (this.isPrivate) {
            const commitment: IOwnershipCommitment = {
                [this.owner]: this.energy
            };
            const { rootHash } = this.generateAndAddProofs(commitment);

            approveTx = await issuerWithSigner.approveCertificationRequestPrivate(
                this.id,
                rootHash,
                validityData
            );
        } else {
            approveTx = await issuerWithSigner.approveCertificationRequest(
                this.id,
                this.energy,
                validityData
            );
        }

        const { events } = await approveTx.wait();

        const certificateId = Number(
            events.find((log: BlockchainEvent) => log.event === 'CertificationRequestApproved')
                .topics[3]
        );

        return certificateId;
    }

    async revoke(): Promise<ethers.ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);
        const revokeTx = await issuerWithSigner.revokeRequest(this.id);
        await revokeTx.wait();

        return revokeTx;
    }

    async requestMigrateToPublic(value: BigNumber): Promise<ethers.ContractTransaction> {
        if (!this.isPrivate) {
            throw new Error('Certificate is already public.');
        }
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const activeUserAddress = await this.configuration.blockchainProperties.activeUser.getAddress();

        const commitment: IOwnershipCommitment = {
            [activeUserAddress]: value
        };
        const { rootHash } = this.generateAndAddProofs(commitment);

        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);
        const tx = await issuerWithSigner.requestMigrateToPublic(this.id, rootHash);
        await tx.wait();

        return tx;
    }
}
