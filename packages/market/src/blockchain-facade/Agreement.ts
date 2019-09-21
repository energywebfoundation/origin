import * as GeneralLib from '@energyweb/utils-general';
import { TransactionReceipt } from 'web3/types'; // eslint-disable-line import/no-unresolved
import AgreementOffChainPropertiesSchema from '../../schemas/AgreementOffChainProperties.schema.json';

export interface IAgreementOffChainProperties {
    start: number;
    end: number;
    price: number;
    currency: GeneralLib.Currency;
    period: number;
    timeFrame: GeneralLib.TimeFrame;
}

export interface IAgreementOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    demandId: string;
    supplyId: string;
}

export interface IAgreement extends IAgreementOnChainProperties {
    offChainProperties: IAgreementOffChainProperties;
}

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements IAgreement {
    offChainProperties: IAgreementOffChainProperties;

    propertiesDocumentHash: string;

    url: string;

    demandId: string;

    supplyId: string;

    approvedBySupplyOwner: boolean;

    approvedByDemandOwner: boolean;

    initialized: boolean;

    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);
        this.initialized = false;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Agreement`;
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
            this.offChainProperties = await this.getOffChainProperties(
                this.propertiesDocumentHash,
                this.getUrl()
            );

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
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const agreementOffChainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOffChain,
        AgreementOffChainPropertiesSchema,
        agreement.getUrl()
    );

    let { url, propertiesDocumentHash } = agreementPropertiesOnChain;

    if (configuration.offChainDataSource) {
        url = agreement.getUrl();
        propertiesDocumentHash = agreementOffChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createAgreement(
        propertiesDocumentHash,
        url,
        agreementPropertiesOnChain.demandId,
        agreementPropertiesOnChain.supplyId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    agreement.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await agreement.putToOffChainStorage(
        agreementPropertiesOffChain,
        agreementOffChainStorageProperties
    );

    if (configuration.logger) {
        configuration.logger.info(`Agreement ${agreement.id} created`);
    }

    return agreement.sync();
};

export const getAgreementListLength = async (
    configuration: GeneralLib.Configuration.Entity
): Promise<number> => {
    return Number(
        await configuration.blockchainProperties.marketLogicInstance.getAllAgreementListLength()
    );
};

export const getAllAgreements = async (configuration: GeneralLib.Configuration.Entity) => {
    const agreementsPromises = Array(await getAgreementListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return (await Promise.all(agreementsPromises)).filter(promise => promise.initialized);
};
