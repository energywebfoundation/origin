import { GeneralActions, IGeneralAction, IEnvironment } from './actions';
import {
    IOffChainDataClient,
    OffChainDataClient,
    ConfigurationClient,
    IConfigurationClient,
    IOrganizationClient,
    IUserClient,
    IRequestClient,
    RequestClient,
    IDeviceClient
} from '@energyweb/origin-backend-client';

export interface IGeneralState {
    accountChangedModalVisible: boolean;
    accountChangedModalEnabled: boolean;
    loading: boolean;
    error: string;
    requestPasswordModalVisible: boolean;
    requestPasswordModalTitle: string;
    requestPasswordModalCallback: (password: string) => void;
    offChainDataClient: IOffChainDataClient;
    configurationClient: IConfigurationClient;
    organizationClient: IOrganizationClient;
    requestClient: IRequestClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    environment: IEnvironment;
    currencies: string[];
    compliance: string;
    country: string;
    regions: object;
}

const requestClient = new RequestClient();

const defaultState: IGeneralState = {
    accountChangedModalVisible: false,
    accountChangedModalEnabled: true,
    loading: true,
    error: null,
    requestPasswordModalVisible: false,
    requestPasswordModalCallback: null,
    requestPasswordModalTitle: null,
    offChainDataClient: new OffChainDataClient(requestClient),
    configurationClient: new ConfigurationClient(requestClient),
    organizationClient: null,
    requestClient,
    userClient: null,
    deviceClient: null,
    environment: null,
    currencies: [],
    compliance: null,
    country: null,
    regions: {}
};

export default function reducer(state = defaultState, action: IGeneralAction): IGeneralState {
    switch (action.type) {
        case GeneralActions.showAccountChangedModal:
            return { ...state, accountChangedModalVisible: true };

        case GeneralActions.hideAccountChangedModal:
            return { ...state, accountChangedModalVisible: false };

        case GeneralActions.disableAccountChangedModal:
            return {
                ...state,
                accountChangedModalVisible: false,
                accountChangedModalEnabled: false
            };

        case GeneralActions.setLoading:
            return {
                ...state,
                loading: action.payload
            };

        case GeneralActions.setError:
            return {
                ...state,
                error: action.payload
            };

        case GeneralActions.showRequestPasswordModal:
            return {
                ...state,
                requestPasswordModalVisible: true,
                requestPasswordModalCallback: action.payload.callback,
                requestPasswordModalTitle: action.payload.title
            };

        case GeneralActions.hideRequestPasswordModal:
            return {
                ...state,
                requestPasswordModalVisible: false,
                requestPasswordModalCallback: null,
                requestPasswordModalTitle: null
            };

        case GeneralActions.setOffChainDataClient:
            return {
                ...state,
                offChainDataClient: action.payload
            };

        case GeneralActions.setConfigurationClient:
            return {
                ...state,
                configurationClient: action.payload
            };

        case GeneralActions.setOrganizationClient:
            return {
                ...state,
                organizationClient: action.payload
            };

        case GeneralActions.setUserClient:
            return {
                ...state,
                userClient: action.payload
            };

        case GeneralActions.setDeviceClient:
            return {
                ...state,
                deviceClient: action.payload
            };

        case GeneralActions.setEnvironment:
            return {
                ...state,
                environment: action.payload
            };

        case GeneralActions.setCurrencies:
            return { ...state, currencies: action.payload.currencies };

        case GeneralActions.setCompliance:
            return { ...state, compliance: action.payload };

        case GeneralActions.setCountry:
            return { ...state, country: action.payload };

        case GeneralActions.setRegions:
            return { ...state, regions: action.payload };

        default:
            return state;
    }
}
