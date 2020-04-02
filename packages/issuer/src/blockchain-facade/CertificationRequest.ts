import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { Configuration, Timestamp } from '@energyweb/utils-general';
import { ICertificationRequest, IOwnershipCommitment } from '@energyweb/origin-backend-core';

import { PreciseProofEntity } from './PreciseProofEntity';

export class Entity extends PreciseProofEntity implements ICertificationRequest {
    owner: string;

    fromTime: Timestamp;

    toTime: Timestamp;

    deviceId: string;

    approved: boolean;

    revoked: boolean;

    created: Timestamp;

    files: string[];

    energy: number;

    initialized = false;

    constructor(
        id: number,
        configuration: Configuration.Entity,
        public isPrivate: boolean = false
    ) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
        const { issuer } = this.configuration.blockchainProperties;

        const issueRequest = await issuer.getCertificationRequest(this.id);
        const decodedData = await issuer.decodeData(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = Number(decodedData['0']);
        this.toTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.approved = issueRequest.approved;
        this.revoked = issueRequest.revoked;

        const newCertificationRequestEvent = await issuer.getAllNewCertificationRequestEvents({
            filter: { _id: this.id }
        });
        const creationBlock = await this.configuration.blockchainProperties.web3.eth.getBlock(
            newCertificationRequestEvent[0].blockNumber
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
        const validityData = this.configuration.blockchainProperties.web3.eth.abi.encodeFunctionCall(
            {
                name: 'isRequestValid',
                type: 'function',
                inputs: [
                    {
                        type: 'uint256',
                        name: '_requestId'
                    }
                ]
            },
            [this.id.toString()]
        );

        let approveTx;
        const { issuer } = this.configuration.blockchainProperties;

        if (this.isPrivate) {
            const commitment: IOwnershipCommitment = {
                [this.owner]: this.energy
            };
            const { rootHash } = this.generateAndAddProofs(commitment);

            approveTx = await issuer.approveCertificationRequestPrivate(
                this.id,
                rootHash,
                validityData,
                Configuration.getAccount(this.configuration)
            );
        } else {
            approveTx = await issuer.approveCertificationRequest(
                this.id,
                this.energy,
                validityData,
                Configuration.getAccount(this.configuration)
            );
        }

        return this.configuration.blockchainProperties.web3.utils.hexToNumber(
            approveTx.logs[1].topics[1]
        );
    }

    async revoke() {
        await this.configuration.blockchainProperties.issuer.revokeRequest(
            this.id,
            Configuration.getAccount(this.configuration)
        );
    }

    async requestMigrateToPublic(value: number) {
        if (!this.isPrivate) {
            throw new Error('Certificate is already public.');
        }
        const { issuer } = this.configuration.blockchainProperties;

        const commitment: IOwnershipCommitment = {
            [this.configuration.blockchainProperties.activeUser.address]: value
        };
        const { rootHash } = this.generateAndAddProofs(commitment);

        return issuer.requestMigrateToPublic(this.id, rootHash);
    }
}

export const createCertificationRequest = async (
    fromTime: Timestamp,
    toTime: Timestamp,
    energy: number,
    deviceId: string,
    configuration: Configuration.Entity,
    files: string[],
    isVolumePrivate = false,
    forAddress?: string
): Promise<Entity> => {
    const request = new Entity(null, configuration, isVolumePrivate);

    const { issuer } = configuration.blockchainProperties;

    await validateGenerationPeriod(fromTime, toTime, deviceId, configuration, isVolumePrivate);

    const data = await issuer.encodeData(fromTime, toTime, deviceId);

    const { logs } = await (forAddress
        ? issuer.requestCertificationFor(
              data,
              forAddress,
              isVolumePrivate,
              Configuration.getAccount(configuration)
          )
        : issuer.requestCertification(
              data,
              isVolumePrivate,
              Configuration.getAccount(configuration)
          ));

    request.id = configuration.blockchainProperties.web3.utils.hexToNumber(logs[0].topics[2]);

    await configuration.offChainDataSource.certificateClient.updateCertificationRequestData(
        request.id,
        { energy, files }
    );

    if (configuration.logger) {
        configuration.logger.info(`CertificationRequest ${request.id} created`);
    }

    return request.sync();
};

const validateGenerationPeriod = async (
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    isPrivate?: boolean
): Promise<boolean> => {
    const { issuer } = configuration.blockchainProperties;

    const moment = extendMoment(Moment);
    const unix = (timestamp: Timestamp) => moment.unix(timestamp);

    const certificationRequestIds = await issuer.getCertificationRequestsForDevice(deviceId);
    const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

    for (const id of certificationRequestIds) {
        const certificationRequest = await new Entity(id, configuration, isPrivate).sync();

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
};

export async function getAllCertificationRequests(
    configuration: Configuration.Entity
): Promise<Entity[]> {
    const { issuer } = configuration.blockchainProperties;

    const totalRequests = await issuer.totalRequests();

    const certificationRequestPromises = Array(Number(totalRequests))
        .fill(null)
        .map(async (item, index) => new Entity(index + 1, configuration).sync());

    return Promise.all(certificationRequestPromises);
}
