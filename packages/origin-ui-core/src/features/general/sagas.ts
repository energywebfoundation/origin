import { call, put, select, take, all, fork, cancelled, apply } from 'redux-saga/effects';
import { SagaIterator, eventChannel, EventChannel } from 'redux-saga';
import {
    setEnvironment,
    IEnvironment,
    GeneralActions,
    setBackendClient,
    setExchangeClient,
    setOffchainConfiguration,
    setLoading,
    IRequestDeviceCreationAction,
    setIRecClient
} from './actions';
import {
    getEnvironment,
    getBackendClient,
    getOffchainConfiguration,
    getExchangeClient
} from './selectors';
import axios, { Canceler } from 'axios';
import { AccountAsset } from '../../utils/exchange';
import { IOriginConfiguration, UserStatus, IUser, IRegions } from '@energyweb/origin-backend-core';
import { BigNumber, ethers } from 'ethers';
import {
    CertificationRequestsClient,
    Configuration as ClientConfiguration,
    CertificatesClient,
    BlockchainPropertiesClient
} from '@energyweb/issuer-api-client';

import { setActiveBlockchainAccountAddress, UsersActions } from '../users/actions';
import { getSearch, push } from 'connected-react-router';
import { getConfiguration, getBaseURL } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { DeviceTypeService } from '@energyweb/utils-general';
import { configurationUpdated, web3Updated } from '../actions';
import { Configuration, ProducingDevice } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../producingDevices/actions';
import { getI18n } from 'react-i18next';
import {
    showNotification,
    NotificationType,
    getDevicesOwnedLink,
    checkNetworkName
} from '../../utils';
import {
    ICertificateViewItem,
    CertificateSource,
    ICertificate,
    updateCertificate,
    addCertificate,
    setCertificatesClient,
    setCertificationRequestsClient,
    setBlockchainPropertiesClient
} from '../certificates';
import { getCertificate } from '../certificates/sagas';
import { getUserOffchain } from '../users/selectors';
import { IProducingDeviceState } from '../producingDevices/reducer';
import { getCertificatesClient, getBlockchainPropertiesClient } from '../certificates/selectors';
import { certificateEnergyStringToBN } from '../../utils/certificates';
import { BackendClient } from '../../utils/clients/BackendClient';
import { LOCAL_STORAGE_KEYS } from '../users/sagas';
import { IRecClient } from '../../utils/clients/IRecClient';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';

function getStoredAuthenticationToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);
}

function createEthereumProviderAccountsChangedEventChannel(ethereumProvider: any) {
    return eventChannel<string[]>((emitter) => {
        ethereumProvider.on('accountsChanged', emitter);

        return () => {
            ethereumProvider.off('accountsChanged', emitter);
        };
    });
}

function* showAccountChangedModalOnChange(): SagaIterator {
    const ethereumProvider = (window as any)?.ethereum;

    if (!ethereumProvider) {
        return;
    }

    const channel: EventChannel<string[]> = yield call(
        createEthereumProviderAccountsChangedEventChannel,
        ethereumProvider
    );

    while (true) {
        const newAccounts: string[] = yield take(channel);

        yield put(setActiveBlockchainAccountAddress((newAccounts && newAccounts[0]) || ''));
    }
}

function prepareGetEnvironmentTask(): {
    getEnvironment: () => Promise<IEnvironment>;
    cancel: Canceler;
} {
    const source = axios.CancelToken.source();

    return {
        getEnvironment: async () => {
            try {
                const response = await axios.get('env-config.js', {
                    cancelToken: source.token
                });

                return response.data;
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.warn('Error while fetching env-config.js', error?.message ?? error);
                }
            }

            return {
                MODE: 'development',
                BACKEND_URL: 'http://localhost',
                BACKEND_PORT: '3030',
                BLOCKCHAIN_EXPLORER_URL: 'https://volta-explorer.energyweb.org',
                WEB3: 'http://localhost:8545',
                REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user',
                MARKET_UTC_OFFSET: 0
            };
        },
        cancel: source.cancel
    };
}

async function getConfigurationFromAPI(
    backendClient: BackendClient
): Promise<IOriginConfiguration> {
    try {
        const { data: config } = await backendClient.configurationClient.get();

        return {
            ...config,
            regions: config.regions as IRegions
        };
    } catch {
        return null;
    }
}

function* setupEnvironment(): SagaIterator {
    let getEnvironmentTask: ReturnType<typeof prepareGetEnvironmentTask>;

    try {
        getEnvironmentTask = yield call(prepareGetEnvironmentTask);

        const environment: IEnvironment = yield call(getEnvironmentTask.getEnvironment);

        yield put(setEnvironment(environment));
    } finally {
        if (yield cancelled()) {
            getEnvironmentTask.cancel();
        }
    }
}

function* fillOffchainConfiguration(): SagaIterator {
    while (true) {
        yield take([GeneralActions.setEnvironment, GeneralActions.setBackendClient]);

        const environment: IEnvironment = yield select(getEnvironment);
        const backendClient: BackendClient = yield select(getBackendClient);

        if (!environment || !backendClient) {
            continue;
        }

        const configuration: IOriginConfiguration = yield call(
            getConfigurationFromAPI,
            backendClient
        );

        yield put(setOffchainConfiguration({ configuration }));
    }
}

function* initializeClients(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);

        if (!environment) {
            continue;
        }

        const authenticationTokenFromStorage = getStoredAuthenticationToken();
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(setBackendClient(new BackendClient(backendUrl, authenticationTokenFromStorage)));
        yield put(
            setExchangeClient(new ExchangeClient(backendUrl, authenticationTokenFromStorage))
        );
        yield put(setIRecClient(new IRecClient(backendUrl, authenticationTokenFromStorage)));

        const clientConfiguration = new ClientConfiguration(
            authenticationTokenFromStorage
                ? {
                      baseOptions: {
                          headers: {
                              Authorization: `Bearer ${authenticationTokenFromStorage}`
                          }
                      },
                      accessToken: authenticationTokenFromStorage
                  }
                : {}
        );

        yield put(
            setBlockchainPropertiesClient(
                new BlockchainPropertiesClient(clientConfiguration, backendUrl)
            )
        );
        yield put(setCertificatesClient(new CertificatesClient(clientConfiguration, backendUrl)));
        yield put(
            setCertificationRequestsClient(
                new CertificationRequestsClient(clientConfiguration, backendUrl)
            )
        );
    }
}

function createConfiguration(
    offchainConfiguration: IOriginConfiguration,
    backendClient: BackendClient,
    logger: Winston.Logger = Winston.createLogger({
        level: 'verbose',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    })
): Configuration.Entity {
    return {
        deviceClient: backendClient.deviceClient,
        logger,
        deviceTypeService: new DeviceTypeService(offchainConfiguration.deviceTypes)
    };
}

export function enhanceCertificate(
    certificate: ICertificate,
    userId: string,
    accountAsset?: AccountAsset
): ICertificateViewItem {
    const isCertificateOnExchange = accountAsset !== undefined;

    return {
        ...certificate,
        energy: isCertificateOnExchange
            ? {
                  publicVolume: BigNumber.from(accountAsset.amount),
                  privateVolume: BigNumber.from(0),
                  claimedVolume: BigNumber.from(0)
              }
            : certificateEnergyStringToBN(certificate.energy),
        source: isCertificateOnExchange ? CertificateSource.Exchange : CertificateSource.Blockchain,
        assetId: accountAsset?.asset?.id
    };
}

function* findEnhancedExchangeCertificate(
    asset: AccountAsset,
    onChainCertificates: ICertificateViewItem[],
    userId: string
) {
    const certificateId = parseInt(asset.asset.tokenId, 10);
    let onChainCertificate = onChainCertificates.find((c) => c.tokenId === certificateId);

    if (!onChainCertificate) {
        onChainCertificate = yield call(getCertificate, certificateId, true);
    }

    return enhanceCertificate(onChainCertificate, userId, asset);
}

export function* fetchDataAfterConfigurationChange(
    configuration: Configuration.Entity,
    update = false
): SagaIterator {
    const producingDevices: IProducingDeviceState[] = yield apply(
        ProducingDevice,
        ProducingDevice.getAllDevices,
        [configuration, true]
    );

    for (const device of producingDevices) {
        yield put(producingDeviceCreatedOrUpdated(device));
    }
    const user = yield select(getUserOffchain);

    if (user) {
        const { blockchainAccountAddress, status }: IUser = user;
        if (status === UserStatus.Active) {
            const certificatesClient: CertificatesClient = yield select(getCertificatesClient);
            const allCertificates: ICertificate[] = (yield apply(
                certificatesClient,
                certificatesClient.getAll,
                []
            )).data;
            const enrichedCertificates = allCertificates.map(
                (c): ICertificateViewItem => enhanceCertificate(c, blockchainAccountAddress)
            );

            const { accountClient }: ExchangeClient = yield select(getExchangeClient);

            const { data: offChainCertificates } = yield apply(
                accountClient,
                accountClient.getAccount,
                null
            );
            const available = yield all(
                offChainCertificates.balances.available.map((asset) =>
                    call(
                        findEnhancedExchangeCertificate,
                        asset,
                        enrichedCertificates,
                        blockchainAccountAddress
                    )
                )
            );
            const certificates = enrichedCertificates.concat(available);
            for (const certificate of certificates) {
                yield put(update ? updateCertificate(certificate) : addCertificate(certificate));
            }
        }
    }
}

function* initializeEnvironment(): SagaIterator {
    while (true) {
        yield take([
            GeneralActions.setEnvironment,
            GeneralActions.setBackendClient,
            GeneralActions.setOffchainConfiguration
        ]);

        const environment: IEnvironment = yield select(getEnvironment);
        const backendClient: BackendClient = yield select(getBackendClient);
        const offchainConfiguration: IOriginConfiguration = yield select(getOffchainConfiguration);

        if (!environment || !backendClient || !offchainConfiguration) {
            continue;
        }

        const configuration: Configuration.Entity = yield call(
            createConfiguration,
            offchainConfiguration,
            backendClient
        );

        yield put(configurationUpdated(configuration));

        try {
            let web3: ethers.providers.JsonRpcProvider = null;
            const routerSearch: string = yield select(getSearch);
            const params = queryString.parse(routerSearch);

            const ethereumProvider = (window as any).ethereum;

            if (params.rpc) {
                web3 = new ethers.providers.JsonRpcProvider(params.rpc as string);
            } else if (ethereumProvider) {
                web3 = new ethers.providers.Web3Provider(ethereumProvider);
                try {
                    // Request account access if needed
                    yield call(ethereumProvider.enable);
                } catch (error) {
                    // User denied account access...
                    console.error({ metaMaskError: error });
                }
            } else if ((window as any).web3) {
                web3 = new ethers.providers.Web3Provider((window as any).web3.currentProvider);
            } else if (environment.WEB3) {
                web3 = new ethers.providers.JsonRpcProvider(environment.WEB3);
            }

            const [userAddress] = yield apply(web3, web3.listAccounts, []);
            yield put(web3Updated(web3));
            yield put(setActiveBlockchainAccountAddress(userAddress));
        } catch (error) {
            showNotification(
                'Please enable your MetaMask browser extension',
                NotificationType.Error
            );
            console.error('ContractsSaga::UnableToFetchBlockchainAddress', error);
        }
        yield put(setLoading(false));
        try {
            yield call(fetchDataAfterConfigurationChange, configuration);
        } catch (error) {
            console.error('initializeEnvironment() error', error);
        }
    }
}

function* checkBlockchainNetwork(): SagaIterator {
    while (true) {
        yield take([UsersActions.setUserState, UsersActions.setUserOffchain]);

        const user = yield select(getUserOffchain);
        const ethereumProvider = (window as any).ethereum;

        if (user && user.status === UserStatus.Active && ethereumProvider) {
            const blockchainPropertiesClient: BlockchainPropertiesClient = yield select(
                getBlockchainPropertiesClient
            );

            const { data: blockchainProperties } = yield apply(
                blockchainPropertiesClient,
                blockchainPropertiesClient.get,
                []
            );
            const metamaskNetId = ethereumProvider.networkVersion;

            if (
                blockchainProperties?.netId !== 1337 &&
                blockchainProperties?.netId !== parseInt(metamaskNetId, 10)
            ) {
                showNotification(
                    `You are connected to the wrong blockchain. ${checkNetworkName(
                        blockchainProperties?.netId
                    )}`,
                    NotificationType.Error,
                    { timeOut: 10000 }
                );
            }
        }
    }
}

function* requestDeviceCreation() {
    while (true) {
        const { payload }: IRequestDeviceCreationAction = yield take(
            GeneralActions.requestDeviceCreation
        );

        const configuration: Configuration.Entity = yield select(getConfiguration);
        const baseURL: string = yield select(getBaseURL);

        if (!configuration) {
            continue;
        }

        yield put(setLoading(true));

        const i18n = getI18n();

        try {
            const device = yield call(ProducingDevice.createDevice, payload, configuration);

            yield put(producingDeviceCreatedOrUpdated(device));

            showNotification(i18n.t('device.feedback.deviceCreated'), NotificationType.Success);

            yield put(push(getDevicesOwnedLink(baseURL)));
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));
    }
}

export function* generalSaga(): SagaIterator {
    yield all([
        fork(showAccountChangedModalOnChange),
        fork(setupEnvironment),
        fork(initializeClients),
        fork(fillOffchainConfiguration),
        fork(initializeEnvironment),
        fork(requestDeviceCreation),
        fork(checkBlockchainNetwork)
    ]);
}
