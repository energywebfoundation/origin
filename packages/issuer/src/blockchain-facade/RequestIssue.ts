import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';
import { PublicIssuer, PrivateIssuer, CommitmentSchema, ICommitment } from '..';
import { CertificateTopic } from '../const';

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

    private issuers: { public: PublicIssuer, private: PrivateIssuer };

    constructor(id: string, configuration: Configuration.Entity, public isPrivate: boolean = false) {
        super(id, configuration);

        this.issuers = this.configuration.blockchainProperties.issuerLogicInstance;
    }

    async sync(): Promise<Entity> {
        const issuer = this.isPrivate ? this.issuers.private : this.issuers.public;

        const issueRequest = await issuer.getRequestIssue(Number(this.id));
        const decodedData = await issuer.decodeIssue(issueRequest.data);

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

        if (this.isPrivate) {
            const commitment: ICommitment = {
                volume: value
            };
            const { rootHash } = this.prepareEntityCreation(commitment, CommitmentSchema);

            approveTx = await this.issuers.private.approveIssue(toAddress, Number(this.id), rootHash, validityData);
        } else {
            approveTx = await this.issuers.public.approveIssue(toAddress, Number(this.id), Number(value), validityData);
        } 

        return this.configuration.blockchainProperties.web3.utils
            .hexToNumber(approveTx.logs[1].topics[1]);
    }

    async revoke() {
        if (this.isPrivate) {
            await this.issuers.private.revokeRequest(Number(this.id));
        } else {
            await this.issuers.public.revokeRequest(Number(this.id));
        } 
    }

    async requestMigrateToPublic(value: number) {
        if (!this.isPrivate) {
            throw new Error('Certificate is already public.');
        }

        const commitment: ICommitment = { volume: value };
        const { rootHash } = this.prepareEntityCreation(commitment, CommitmentSchema);

        return this.issuers.private.requestMigrateToPublic(Number(this.id), rootHash);
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

    const issuer = isVolumePrivate 
        ? configuration.blockchainProperties.issuerLogicInstance.private
        : configuration.blockchainProperties.issuerLogicInstance.public;

    const data = await issuer.encodeIssue(fromTime, toTime, deviceId);

    const fromAccount = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    const certificateTopic = isVolumePrivate ? CertificateTopic.PRIVATE_IREC : CertificateTopic.PUBLIC_IREC;

    const { logs } = await (
        forAddress
            ? issuer.requestIssueFor(certificateTopic, data, forAddress, fromAccount) 
            : issuer.requestIssue(certificateTopic, data, fromAccount)
    );

    request.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[2])
        .toString();

    if (configuration.logger) {
        configuration.logger.info(`RequestIssue ${request.id} created`);
    }

    return request.sync();
};
