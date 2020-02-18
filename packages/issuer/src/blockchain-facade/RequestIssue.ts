import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';
import { Issuer, IOwnershipCommitment, OwnershipCommitmentSchema } from '..';

export interface IRequestIssueOnChainProperties {
    id: string;
    owner: string;
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string;
    approved: boolean;
    revoked: boolean;
}

export class Entity extends BlockchainDataModelEntity.Entity implements IRequestIssueOnChainProperties {

    public owner: string;
    public fromTime: Timestamp;
    public toTime: Timestamp;
    public deviceId: string;
    public approved: boolean;
    public revoked: boolean;

    public initialized: boolean = false;

    constructor(id: string, configuration: Configuration.Entity, public isPrivate: boolean = false) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
        const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;

        const issueRequest = await issuer.getIssuanceRequest(Number(this.id));
        const decodedData = await issuer.decodeData(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = Number(decodedData['0']);
        this.toTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.approved = issueRequest.approved;
        this.revoked = issueRequest.revoked;

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`RequestIssue ${this.id} synced`);
        }

        return this;
    }

    async approve(toAddress: string, value: number): Promise<number> {
        const validityData = this.configuration.blockchainProperties.web3.eth.abi.encodeFunctionCall({
            name: 'isRequestValid',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: '_requestId'
            }]
        }, [this.id.toString()]);

        let approveTx;
        const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;

        if (this.isPrivate) {
            const commitment: IOwnershipCommitment = {
                ownerAddress: toAddress,
                volume: value
            };
            const { rootHash } = this.prepareEntityCreation(commitment, OwnershipCommitmentSchema);

            approveTx = await issuer.approveIssuancePrivate(toAddress, Number(this.id), rootHash, validityData);
        } else {
            approveTx = await issuer.approveIssuance(toAddress, Number(this.id), Number(value), validityData);
        } 

        return this.configuration.blockchainProperties.web3.utils
            .hexToNumber(approveTx.logs[1].topics[1]);
    }

    async revoke() {
        const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;
        await issuer.revokeRequest(Number(this.id));
    }

    async requestMigrateToPublic(value: number) {
        if (!this.isPrivate) {
            throw new Error('Certificate is already public.');
        }

        // const owners = { [this.owner]: value };
        // const commitment: ICommitment = { owners };
        // const { rootHash } = this.prepareEntityCreation(commitment, CommitmentSchema);

        // return this.issuers.private.requestMigrateToPublic(Number(this.id), rootHash);
    }
}

export const createRequestIssue = async (
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    isVolumePrivate: boolean = false,
    forAddress?: string,
): Promise<Entity> => {
    const request = new Entity(null, configuration, isVolumePrivate);

    const issuer: Issuer = configuration.blockchainProperties.issuerLogicInstance;

    await validateGenerationPeriod(fromTime, toTime, deviceId, configuration, isVolumePrivate);

    const data = await issuer.encodeData(fromTime, toTime, deviceId);

    const { logs } = await (
        forAddress
            ? issuer.requestIssuanceFor(data, forAddress, isVolumePrivate, Configuration.getAccount(configuration)) 
            : issuer.requestIssuance(data, isVolumePrivate, Configuration.getAccount(configuration))
    );

    request.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[2])
        .toString();

    if (configuration.logger) {
        configuration.logger.info(`RequestIssue ${request.id} created`);
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
    const issuer: Issuer = configuration.blockchainProperties.issuerLogicInstance;

    const moment = extendMoment(Moment);
    const unix = (timestamp: Timestamp) => moment.unix(timestamp);

    const requestIssueIds = await issuer.getIssuanceRequestsForDevice(deviceId, Configuration.getAccount(configuration));
    const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

    for (const id of requestIssueIds) {
        const requestIssue = await new Entity(id, configuration, isPrivate).sync();

        if (requestIssue.revoked) {
            continue;
        }

        const requestIssueGenerationRange = moment.range(unix(requestIssue.fromTime), unix(requestIssue.toTime));

        if (generationTimeRange.overlaps(requestIssueGenerationRange)) {
            throw new Error(
                `Generation period ` + 
                `${unix(fromTime).format()} - ${unix(toTime).format()}` + 
                ` overlaps with the time period of ` + 
                `${unix(requestIssue.fromTime).format()} - ${unix(requestIssue.toTime).format()}` + 
                ` of request ${requestIssue.id}.`
            );
        }
    }

    return true;
}