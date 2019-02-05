import * as EwMarket from 'ew-market-lib';
import { IdentifiableEntity } from './';

export interface AgreementData extends IdentifiableEntity {
    offChainProperties: EwMarket.Agreement.AgreementOffChainProperties;
    onChainProperties: EwMarket.Agreement.AgreementOnChainProperties;
    matcherOffChainProperties: EwMarket.Agreement.MatcherOffchainProperties;
}

export interface RegisterAgreementAction {
    type: RegisterAgreementActionType;
    data: AgreementData;
}

export enum RegisterAgreementActionType {
    RegisterAgreement = 'REGISTER_AGREEMENT',
}

export const agreementDataToEntity = (agreementData: AgreementData): EwMarket.Agreement.Entity => {
    const agreement = new EwMarket.Agreement.Entity(agreementData.id, null);
    agreement.offChainProperties = agreementData.offChainProperties;
    agreement.matcherOffChainProperties = agreementData.matcherOffChainProperties;
    Object.keys(agreementData.onChainProperties)
        .forEach((key: string) => agreement[key] = agreementData.onChainProperties[key]);
    return agreement;

};