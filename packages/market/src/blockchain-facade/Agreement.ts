import * as GeneralLib from '@energyweb/utils-general';
import { TransactionReceipt } from 'web3/types'; // eslint-disable-line import/no-unresolved
import AgreementOffChainPropertiesSchema from '../../schemas/AgreementOffChainProperties.schema.json';
import MatcherOffChainPropertiesSchema from '../../schemas/MatcherOffChainProperties.schema.json';

export interface IAgreementOffChainProperties {
    start: number;
    end: number;
    price: number;
    currency: GeneralLib.Currency;
    period: number;
    timeFrame: GeneralLib.TimeFrame;
}

export interface IMatcherOffChainProperties {
    currentWh: number;
    currentPeriod: number;
}

export interface IAgreementOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    matcherPropertiesDocumentHash: string;
    matcherDBUrl: string;
    demandId: string;
    supplyId: string;
    allowedMatcher: string[];
}

export interface IAgreement extends IAgreementOnChainProperties {
    offChainProperties: IAgreementOffChainProperties;
    matcherOffChainProperties: IMatcherOffChainProperties;
}

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements IAgreement {
    matcherOffChainProperties: IMatcherOffChainProperties;

    offChainProperties: IAgreementOffChainProperties;

    propertiesDocumentHash: string;

    url: string;

    matcherPropertiesDocumentHash: string;

    matcherDBUrl: string;

    demandId: string;

    supplyId: string;

    approvedBySupplyOwner: boolean;

    approvedByDemandOwner: boolean;

    allowedMatcher: string[];

    initialized: boolean;

    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);
        this.initialized = false;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Agreement`;
    }

    getMatcherURL(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Matcher`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const agreement = await this.configuration.blockchainProperties.marketLogicInstance.getAgreement(
                this.id
            );

            this.propertiesDocumentHash = agreement._propertiesDocumentHash;
            this.url = agreement._documentDBURL;
            this.matcherPropertiesDocumentHash = agreement._matcherPropertiesDocumentHash;
            this.matcherDBUrl = agreement._matcherDBURL;
            this.demandId = agreement._demandId;
            this.supplyId = agreement._supplyId;
            this.approvedBySupplyOwner = agreement._approvedBySupplyOwner;
            this.approvedByDemandOwner = agreement._approvedByDemandOwner;
            this.allowedMatcher = agreement._allowedMatcher;
            this.offChainProperties = await this.getOffChainProperties(
                this.propertiesDocumentHash,
                this.getUrl()
            );

            this.matcherOffChainProperties = await this.getOffChainProperties(
                this.matcherPropertiesDocumentHash,
                this.getMatcherURL()
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

    async setMatcherProperties(
        matcherOffChainProperties: IMatcherOffChainProperties
    ): Promise<TransactionReceipt> {
        const matcherOffChainStorageProperties = this.prepareEntityCreation(
            matcherOffChainProperties,
            MatcherOffChainPropertiesSchema,
            this.getMatcherURL()
        );

        let tx;

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            tx = await this.configuration.blockchainProperties.marketLogicInstance.setMatcherProperties(
                this.id,
                matcherOffChainStorageProperties.rootHash,
                this.matcherDBUrl,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            tx = await this.configuration.blockchainProperties.marketLogicInstance.setMatcherProperties(
                this.id,
                matcherOffChainStorageProperties.rootHash,
                this.matcherDBUrl,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }

        await this.putToOffChainStorage(
            matcherOffChainProperties,
            matcherOffChainStorageProperties,
            this.getMatcherURL()
        );

        return tx;
    }
}

export const createAgreement = async (
    agreementPropertiesOnChain: IAgreementOnChainProperties,
    agreementPropertiesOffChain: IAgreementOffChainProperties,
    matcherPropertiesOffChain: IMatcherOffChainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const agreementOffChainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOffChain,
        AgreementOffChainPropertiesSchema,
        agreement.getUrl()
    );

    const matcherOffChainStorageProperties = agreement.prepareEntityCreation(
        matcherPropertiesOffChain,
        MatcherOffChainPropertiesSchema,
        agreement.getMatcherURL()
    );

    let {
        url,
        propertiesDocumentHash,
        matcherDBUrl,
        matcherPropertiesDocumentHash
    } = agreementPropertiesOnChain;

    if (configuration.offChainDataSource) {
        url = agreement.getUrl();
        propertiesDocumentHash = agreementOffChainStorageProperties.rootHash;

        matcherDBUrl = agreement.getMatcherURL();
        matcherPropertiesDocumentHash = matcherOffChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createAgreement(
        propertiesDocumentHash,
        url,
        matcherPropertiesDocumentHash,
        matcherDBUrl,
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
    await agreement.putToOffChainStorage(
        matcherPropertiesOffChain,
        matcherOffChainStorageProperties,
        agreement.getMatcherURL()
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
