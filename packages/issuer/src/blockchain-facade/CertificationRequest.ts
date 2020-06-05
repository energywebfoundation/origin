import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { BigNumber, Interface } from 'ethers/utils';
import { Event as BlockchainEvent } from 'ethers';
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
import { IssuerJSON } from '../contracts';

export class CertificationRequest extends PreciseProofEntity implements ICertificationRequest {
    owner: string;

    fromTime: Timestamp;

    toTime: Timestamp;

    deviceId: string;

    approved: boolean;

    revoked: boolean;

    created: Timestamp;

    files: string[];

    energy: BigNumber;

    initialized = false;

    constructor(
        id: number,
        configuration: Configuration.Entity,
        public isPrivate: boolean = false
    ) {
        super(id, configuration);
    }

    public static async create(
        fromTime: Timestamp,
        toTime: Timestamp,
        energy: BigNumber,
        deviceId: string,
        configuration: Configuration.Entity,
        files: string[],
        isVolumePrivate = false,
        forAddress?: string
    ): Promise<CertificationRequest> {
        if (energy.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${energy}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const request = new CertificationRequest(null, configuration, isVolumePrivate);

        const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
            Registry,
            Issuer
        >;
        const issuerWithSigner = issuer.connect(configuration.blockchainProperties.activeUser);

        await this.validateGenerationPeriod(fromTime, toTime, deviceId, configuration);

        const success = await configuration.offChainDataSource.certificateClient.queueCertificationRequestData(
            { deviceId, fromTime, toTime, energy, files }
        );

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request.id = (certificationRequested.args as any)._id.toNumber();

        if (configuration.logger) {
            configuration.logger.info(`CertificationRequest ${request.id} created`);
        }

        return request.sync();
    }

    async sync(): Promise<CertificationRequest> {
        const offChainData = await polly()
            .waitAndRetry([2000, 4000, 8000, 16000])
            .executeForPromise(() =>
                this.configuration.offChainDataSource.certificateClient.getCertificationRequest(
                    this.id
                )
            );

        Object.assign(this, offChainData);

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`CertificationRequest ${this.id} synced`);
        }

        return this;
    }

    async approve(): Promise<number> {
        const issuerInterface = new Interface(IssuerJSON.abi);
        const validityData = issuerInterface.functions.isRequestValid.encode([this.id.toString()]);

        let approveTx;
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
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

    async revoke() {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);
        const revokeTx = await issuerWithSigner.revokeRequest(this.id);
        await revokeTx.wait();
    }

    async requestMigrateToPublic(value: BigNumber) {
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

    public static async getAll(
        configuration: Configuration.Entity
    ): Promise<CertificationRequest[]> {
        const all = await configuration.offChainDataSource.certificateClient.getAllCertificationRequests();

        const certificationRequestPromises = all.map((certReq) =>
            new CertificationRequest(certReq.id, configuration).sync()
        );

        return Promise.all(certificationRequestPromises);
    }

    private static async validateGenerationPeriod(
        fromTime: Timestamp,
        toTime: Timestamp,
        deviceId: string,
        configuration: Configuration.Entity
    ): Promise<boolean> {
        const moment = extendMoment(Moment);
        const unix = (timestamp: Timestamp) => moment.unix(timestamp);

        const allCertificationRequests = await this.getAll(configuration);

        const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

        for (const certificationRequest of allCertificationRequests) {
            if (certificationRequest.revoked || certificationRequest.deviceId !== deviceId) {
                continue;
            }

            const certificationRequestGenerationRange = moment.range(
                unix(certificationRequest.fromTime),
                unix(certificationRequest.toTime)
            );

            if (generationTimeRange.overlaps(certificationRequestGenerationRange)) {
                throw new Error(
                    `Generation period ` +
                        `${unix(fromTime).format()} - ${unix(toTime).format()}` +
                        ` overlaps with the time period of ` +
                        `${unix(certificationRequest.fromTime).format()} - ${unix(
                            certificationRequest.toTime
                        ).format()}` +
                        ` of request ${certificationRequest.id}.`
                );
            }
        }

        return true;
    }
}
