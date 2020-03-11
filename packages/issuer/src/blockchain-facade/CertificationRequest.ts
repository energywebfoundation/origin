import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';
import { ICertificationRequest } from '@energyweb/origin-backend-core';

import { Issuer, IOwnershipCommitment, OwnershipCommitmentSchema } from '..';

export class Entity extends BlockchainDataModelEntity.Entity implements ICertificationRequest {

    owner: string;
    fromTime: Timestamp;
    toTime: Timestamp;
    device: number;
    approved: boolean;
    revoked: boolean;
    created: Timestamp;
    files: string[];

    initialized: boolean = false;

    constructor(id: string, configuration: Configuration.Entity, public isPrivate: boolean = false) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const issueRequest = await issuer.getCertificationRequest(Number(this.id));
        const decodedData = await issuer.decodeData(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = Number(decodedData['0']);
        this.toTime = Number(decodedData['1']);
        this.device = Number(decodedData['2']);
        this.approved = issueRequest.approved;
        this.revoked = issueRequest.revoked;
        this.created = 0; // TO-DO replace with a proper timestamp
        this.files = (await this.configuration.offChainDataSource.certificateClient.getCertificationRequestData(this.id)).files;

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`CertificationRequest ${this.id} synced`);
        }

        return this;
    }

    async approve(value: number): Promise<number> {
        const validityData = this.configuration.blockchainProperties.web3.eth.abi.encodeFunctionCall({
            name: 'isRequestValid',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: '_requestId'
            }]
        }, [this.id.toString()]);

        let approveTx;
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        if (this.isPrivate) {
            const commitment: IOwnershipCommitment = {
                ownerAddress: this.owner,
                volume: value
            };
            const { rootHash } = this.prepareEntityCreation(commitment, OwnershipCommitmentSchema);

            approveTx = await issuer.approveCertificationRequestPrivate(
                this.owner,
                Number(this.id),
                rootHash,
                validityData,
                Configuration.getAccount(this.configuration)
            );
        } else {
            approveTx = await issuer.approveCertificationRequest(
                this.owner,
                Number(this.id),
                Number(value),
                validityData,
                Configuration.getAccount(this.configuration)
            );
        } 

        return this.configuration.blockchainProperties.web3.utils
            .hexToNumber(approveTx.logs[1].topics[1]);
    }

    async revoke() {
        await this.configuration.blockchainProperties.issuer.revokeRequest(
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
    }

    async requestMigrateToPublic(value: number) {
        if (!this.isPrivate) {
            throw new Error('Certificate is already public.');
        }
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const commitment: IOwnershipCommitment = {
            ownerAddress: this.configuration.blockchainProperties.activeUser.address,
            volume: value
        };
        const { rootHash } = this.prepareEntityCreation(commitment, OwnershipCommitmentSchema);

        return issuer.requestMigrateToPublic(Number(this.id), rootHash);
    }
}

export const createCertificationRequest = async (
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    files: string[],
    isVolumePrivate: boolean = false,
    forAddress?: string,
): Promise<Entity> => {
    const request = new Entity(null, configuration, isVolumePrivate);

    const issuer: Issuer = configuration.blockchainProperties.issuer;

    await validateGenerationPeriod(fromTime, toTime, deviceId, configuration, isVolumePrivate);

    const data = await issuer.encodeData(fromTime, toTime, deviceId);

    const { logs } = await (
        forAddress
            ? issuer.requestCertificationFor(data, forAddress, isVolumePrivate, Configuration.getAccount(configuration)) 
            : issuer.requestCertification(data, isVolumePrivate, Configuration.getAccount(configuration))
    );

    request.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[2])
        .toString();

    await configuration.offChainDataSource.certificateClient.updateCertificationRequestData(
        request.id,
        { files }
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
    const issuer: Issuer = configuration.blockchainProperties.issuer;

    const moment = extendMoment(Moment);
    const unix = (timestamp: Timestamp) => moment.unix(timestamp);

    const certificationRequestIds = await issuer.getCertificationRequestsForDevice(deviceId);
    const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

    for (const id of certificationRequestIds) {
        const certificationRequest = await new Entity(id, configuration, isPrivate).sync();

        if (certificationRequest.revoked) {
            continue;
        }

        const certificationRequestGenerationRange = moment.range(unix(certificationRequest.fromTime), unix(certificationRequest.toTime));

        if (generationTimeRange.overlaps(certificationRequestGenerationRange)) {
            throw new Error(
                `Generation period ` + 
                `${unix(fromTime).format()} - ${unix(toTime).format()}` + 
                ` overlaps with the time period of ` + 
                `${unix(certificationRequest.fromTime).format()} - ${unix(certificationRequest.toTime).format()}` + 
                ` of request ${certificationRequest.id}.`
            );
        }
    }

    return true;
}

export async function getAllCertificationRequests(configuration: Configuration.Entity): Promise<Entity[]> {
    const issuer: Issuer = configuration.blockchainProperties.issuer;

    const totalRequests = await issuer.totalRequests();

    const certificationRequestPromises = Array(Number(totalRequests))
        .fill(null)
        .map(async (item, index) => new Entity((index + 1).toString(), configuration).sync());

    return Promise.all(certificationRequestPromises);
};