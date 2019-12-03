import polly from 'polly-js';
import { TransactionReceipt } from 'web3-core';

import {
    BlockchainDataModelEntity,
    Timestamp,
    Currency,
    TimeFrame,
    Configuration
} from '@energyweb/utils-general';
import AgreementOffChainPropertiesSchema from '../../schemas/AgreementOffChainProperties.schema.json';

export interface IAgreementOffChainProperties {
    start: Timestamp;
    end: Timestamp;
    price: number;
    currency: Currency;
    period: number;
    timeFrame: TimeFrame;
}

export interface IAgreementOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    demandId: string;
    supplyId: string;
}

export interface IAgreement extends IAgreementOnChainProperties {
    offChainProperties: IAgreementOffChainProperties;
}

export class Entity extends BlockchainDataModelEntity.Entity implements IAgreement {
    offChainProperties: IAgreementOffChainProperties;

    demandId: string;

    supplyId: string;

    approvedBySupplyOwner: boolean;

    approvedByDemandOwner: boolean;

    initialized: boolean;

    configuration: Configuration.Entity;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);
        this.initialized = false;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const agreement = await this.configuration.blockchainProperties.marketLogicInstance.getAgreement(
                this.id
            );

            this.propertiesDocumentHash = agreement._propertiesDocumentHash;
            this.url = agreement._documentDBURL;
            this.demandId = agreement._demandId;
            this.supplyId = agreement._supplyId;
            this.approvedBySupplyOwner = agreement._approvedBySupplyOwner;
            this.approvedByDemandOwner = agreement._approvedByDemandOwner;
            this.offChainProperties = await this.getOffChainProperties();

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Agreement with ${this.id} synced`);
            }

            this.initialized = true;
        }

        return this;
    }

    async approveAgreementDemand(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementDemand(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementDemand(
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async approveAgreementSupply(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementSupply(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementSupply(
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }
}

export const createAgreement = async (
    agreementPropertiesOnChain: IAgreementOnChainProperties,
    agreementPropertiesOffChain: IAgreementOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const offChainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOffChain,
        AgreementOffChainPropertiesSchema
    );

    let { url, propertiesDocumentHash } = agreementPropertiesOnChain;

    propertiesDocumentHash = offChainStorageProperties.rootHash;
    url = `${agreement.baseUrl}/${propertiesDocumentHash}`;

    await polly()
        .waitAndRetry(10)
        .executeForPromise(async () => {
            agreement.id = (await getAgreementListLength(configuration)).toString();
            await agreement.throwIfExists();
        });

    await agreement.syncOffChainStorage(agreementPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateAgreement,
        logs
    } = await configuration.blockchainProperties.marketLogicInstance.createAgreement(
        propertiesDocumentHash,
        url,
        agreementPropertiesOnChain.demandId,
        agreementPropertiesOnChain.supplyId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    if (!successCreateAgreement) {
        await agreement.deleteFromOffChainStorage();
        throw new Error('createAgreement: Saving on-chain data failed. Reverting...');
    }

    const idFromTx = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[1])
        .toString();

    if (agreement.id !== idFromTx) {
        agreement.id = idFromTx;
        await agreement.syncOffChainStorage(agreementPropertiesOffChain, offChainStorageProperties);
    }

    if (configuration.logger) {
        configuration.logger.info(`Agreement ${agreement.id} created`);
    }

    return agreement.sync();
};

export const getAgreementListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
    return Number(
        await configuration.blockchainProperties.marketLogicInstance.getAllAgreementListLength()
    );
};

export const getAllAgreements = async (configuration: Configuration.Entity) => {
    const agreementsPromises = Array(await getAgreementListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return (await Promise.all(agreementsPromises)).filter(promise => promise.initialized);
};
