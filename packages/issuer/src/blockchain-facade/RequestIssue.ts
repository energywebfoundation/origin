import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';
import { PublicIssuer } from '..';

export interface IRequestIssueOnChainProperties  {
    id: string;
    owner: string;
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string;
    approved: boolean;
}

export class Entity extends BlockchainDataModelEntity.Entity implements IRequestIssueOnChainProperties {

    owner: string;
    fromTime: Timestamp;
    toTime: Timestamp;
    deviceId: string;
    approved: boolean;
    initialized: boolean = false;

    async sync(): Promise<Entity> {
        const publicIssuer = this.configuration.blockchainProperties.issuerLogicInstance.public;
        const issueRequest = await publicIssuer.getRequestIssue(Number(this.id));

        const decodedData = await publicIssuer.decodeIssue(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = Number(decodedData['0']);
        this.toTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.approved = issueRequest.approved;

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`RequestIssue ${this.id} synced`);
        }

        return this;
    }

    async approve(toAddress: string, value: number): Promise<number> {
        const validityData = this.configuration.blockchainProperties.web3.eth.abi.encodeFunctionCall({
            name: 'isValid',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: '_requestId'
            }]
        }, [this.id.toString()]);

        const tx = await this.configuration.blockchainProperties.issuerLogicInstance.public.approveIssue(toAddress, this.id, value, validityData);

        return this.configuration.blockchainProperties.web3.utils
            .hexToNumber(tx.logs[1].topics[1]);
    }
}

export const createRequestIssue = async (
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    forAddress?: string
): Promise<Entity> => {
    const request = new Entity(null, configuration);

    const fromAccount = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    const issuerLogicInstance: PublicIssuer = configuration.blockchainProperties.issuerLogicInstance.public;

    const data = await issuerLogicInstance.encodeIssue(fromTime, toTime, deviceId);

    const { logs } = await (
        forAddress 
            ? issuerLogicInstance.requestIssueFor(data, forAddress, fromAccount) 
            : issuerLogicInstance.requestIssue(data, fromAccount)
    );

    request.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[2])
        .toString();

    if (configuration.logger) {
        configuration.logger.info(`RequestIssue ${request.id} created`);
    }

    return request.sync();
};
