import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { BigNumber, Interface } from 'ethers/utils';
import { Event as BlockchainEvent } from 'ethers';

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
import { getEventsFromContract } from '../utils/events';

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

        await this.validateGenerationPeriod(
            fromTime,
            toTime,
            deviceId,
            configuration,
            isVolumePrivate
        );

        const data = await issuer.encodeData(fromTime, toTime, deviceId);

        const tx = await (forAddress
            ? issuerWithSigner.requestCertificationFor(data, forAddress, isVolumePrivate)
            : issuerWithSigner.requestCertification(data, isVolumePrivate));

        const { events } = await tx.wait();

        request.id = Number(
            events.find((log: BlockchainEvent) => log.event === 'CertificationRequested').topics[2]
        );

        const success = await configuration.offChainDataSource.certificateClient.updateCertificationRequestData(
            request.id,
            { energy, files }
        );

        if (success) {
            if (configuration.logger) {
                configuration.logger.info(`CertificationRequest ${request.id} created`);
            }
        } else {
            throw new Error('Unable to create CertificationRequest');
        }

        return request.sync();
    }

    async sync(): Promise<CertificationRequest> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const issueRequest = await issuer.getCertificationRequest(this.id);
        const decodedData = await issuer.decodeData(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = Number(decodedData['0']);
        this.toTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.approved = issueRequest.approved;
        this.revoked = issueRequest.revoked;

        const certificationRequestedLogs = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequested(null, this.id, null)
        );

        const creationBlock = await issuer.provider.getBlock(
            certificationRequestedLogs[0].blockNumber
        );

        this.created = Number(creationBlock.timestamp);

        const offChainData = await this.configuration.offChainDataSource.certificateClient.getCertificationRequestData(
            this.id
        );
        this.energy = offChainData.energy;
        this.files = offChainData.files;

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

    private static async validateGenerationPeriod(
        fromTime: Timestamp,
        toTime: Timestamp,
        deviceId: string,
        configuration: Configuration.Entity,
        isPrivate?: boolean
    ): Promise<boolean> {
        const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
            Registry,
            Issuer
        >;

        const moment = extendMoment(Moment);
        const unix = (timestamp: Timestamp) => moment.unix(timestamp);

        const certificationRequestedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequested(null, null, deviceId)
        );

        const certificationRequestIds = certificationRequestedEvents.map((event) => event._id);

        const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

        for (const id of certificationRequestIds) {
            const certificationRequest = await new CertificationRequest(
                id.toNumber(),
                configuration,
                isPrivate
            ).sync();

            if (certificationRequest.revoked) {
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

export async function getAllCertificationRequests(
    configuration: Configuration.Entity
): Promise<CertificationRequest[]> {
    const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const totalRequests = await issuer.totalRequests();

    const certificationRequestPromises = Array(Number(totalRequests))
        .fill(null)
        .map(async (item, index) => new CertificationRequest(index + 1, configuration).sync());

    return Promise.all(certificationRequestPromises);
}
