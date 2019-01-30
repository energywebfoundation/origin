import * as GeneralLib from 'ew-utils-general-lib';
import { TransactionReceipt } from 'web3/types';

export interface AgreementOnChainProperties extends GeneralLib.BlockchainDataModelEntity.OnChainProperties {
    demandId: number;
    supplyId: number;
}

export const createAgreement = async (agreementPropertiesOnChain: AgreementOnChainProperties,
                                      configuration: GeneralLib.Configuration.Entity): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const tx = await configuration.blockchainProperties.demandLogicInstance.createAgreement(
        agreementPropertiesOnChain.propertiesDocumentHash,
        agreementPropertiesOnChain.url,
        agreementPropertiesOnChain.demandId,
        agreementPropertiesOnChain.supplyId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey,
        },
    );

    agreement.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

    configuration.logger.info(`Agreement ${agreement.id} created`);

    return agreement.sync();

};

export const getAllAgreementListLength = async (conf: GeneralLib.Configuration.Entity): Promise<number> => {
    return conf.blockchainProperties.demandLogicInstance.getAllAgreementListLength();
};

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements AgreementOnChainProperties {

    propertiesDocumentHash: string;
    url: string;
    demandId: number;
    supplyId: number;
    approvedBySupplyOwner: boolean;
    approvedByDemandOwner: boolean;

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = true;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Agreement`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const agreement = await this.configuration.blockchainProperties.demandLogicInstance.getAgreement(this.id);

            this.propertiesDocumentHash = agreement._propertiesDocumentHash;
            this.url = agreement._documentDBURL;
            this.demandId = agreement._demandId;
            this.supplyId = agreement._supplyId;
            this.approvedBySupplyOwner = agreement._approvedBySupplyOwner;
            this.approvedByDemandOwner = agreement._approvedByDemandOwner;
            this.initialized = true;
        }
        return this;
    }

    async approveAgreementDemand(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.demandLogicInstance.approveAgreementDemand(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.demandLogicInstance.approveAgreementDemand(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

    async approveAgreementSupply(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.demandLogicInstance.approveAgreementSupply(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.demandLogicInstance.approveAgreementSupply(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }
}