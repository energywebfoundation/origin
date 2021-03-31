import { call, put, select, take, all, fork, cancelled, apply } from 'redux-saga/effects';
import { SagaIterator, eventChannel, EventChannel } from 'redux-saga';
import { IEnvironment, GeneralActions, fromGeneralActions } from './actions';
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

import { UsersActions, LOCAL_STORAGE_KEYS, fromUsersActions, fromUsersSelectors } from '../users';
import { getSearch } from 'connected-react-router';
import { configurationUpdated } from '../configuration';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { DeviceTypeService } from '@energyweb/utils-general';

import { web3Updated } from '../web3';
import { Configuration } from '@energyweb/device-registry';
import {
    showNotification,
    NotificationTypeEnum,
    checkNetworkName,
    BackendClient,
    IRecClient,
    ExchangeClient
} from '../../utils';
import {
    ICertificateViewItem,
    CertificateSource,
    ICertificate,
    updateCertificate,
    addCertificate,
    setCertificatesClient,
    setCertificationRequestsClient,
    setBlockchainPropertiesClient,
    getCertificatesClient,
    getBlockchainPropertiesClient,
    getCertificate
} from '../certificates';

import { certificateEnergyStringToBN } from '../../utils/certificates';
import { fromGeneralSelectors } from './selectors';

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

        yield put(
            fromUsersActions.setActiveBlockchainAccountAddress(
                (newAccounts && newAccounts[0]) || ''
            )
        );
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
                const response = await axios.get('env-config.json', {
                    cancelToken: source.token
                });

                return response.data;
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.warn('Error while fetching env-config.json', error?.message ?? error);
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

        yield put(fromGeneralActions.setEnvironment(environment));
    } finally {
        if (yield cancelled()) {
            getEnvironmentTask.cancel();
        }
    }
}

function* fillOffchainConfiguration(): SagaIterator {
    while (true) {
        yield take([GeneralActions.setEnvironment, GeneralActions.setBackendClient]);

        const environment: IEnvironment = yield select(fromGeneralSelectors.getEnvironment);
        const backendClient: BackendClient = yield select(fromGeneralSelectors.getBackendClient);

        if (!environment || !backendClient) {
            continue;
        }

        const configuration: IOriginConfiguration = yield call(
            getConfigurationFromAPI,
            backendClient
        );

        yield put(fromGeneralActions.setOffchainConfiguration({ configuration }));
    }
}

function* initializeClients(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(fromGeneralSelectors.getEnvironment);

        if (!environment) {
            continue;
        }

        const authenticationTokenFromStorage = getStoredAuthenticationToken();
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(
            fromGeneralActions.setBackendClient(
                new BackendClient(backendUrl, authenticationTokenFromStorage)
            )
        );
        yield put(
            fromGeneralActions.setExchangeClient(
                new ExchangeClient(backendUrl, authenticationTokenFromStorage)
            )
        );
        yield put(
            fromGeneralActions.setIRecClient(
                new IRecClient(backendUrl, authenticationTokenFromStorage)
            )
        );

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

export function* fetchDataAfterConfigurationChange(update = false): SagaIterator {
    const user = yield select(fromUsersSelectors.getUserOffchain);

    if (user) {
        const { blockchainAccountAddress, status }: IUser = user;
        if (status === UserStatus.Active) {
            const certificatesClient: CertificatesClient = yield select(getCertificatesClient);
            const { data: allCertificates }: { data: ICertificate[] } = yield apply(
                certificatesClient,
                certificatesClient.getAll,
                null
            );
            const enrichedCertificates = allCertificates.map(
                (c): ICertificateViewItem => enhanceCertificate(c, blockchainAccountAddress)
            );

            const { accountBalanceClient }: ExchangeClient = yield select(
                fromGeneralSelectors.getExchangeClient
            );

            const {
                data: { available }
            } = yield apply(accountBalanceClient, accountBalanceClient.get, null);

            const enhanced = yield all(
                available.map((asset) =>
                    call(
                        findEnhancedExchangeCertificate,
                        asset,
                        enrichedCertificates,
                        blockchainAccountAddress
                    )
                )
            );
            const certificates = enrichedCertificates.concat(enhanced);
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

        const environment: IEnvironment = yield select(fromGeneralSelectors.getEnvironment);
        const backendClient: BackendClient = yield select(fromGeneralSelectors.getBackendClient);
        const offchainConfiguration: IOriginConfiguration = yield select(
            fromGeneralSelectors.getOffchainConfiguration
        );

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
            yield put(fromUsersActions.setActiveBlockchainAccountAddress(userAddress));
        } catch (error) {
            showNotification(
                'Please enable your MetaMask browser extension',
                NotificationTypeEnum.Error
            );
            console.error('ContractsSaga::UnableToFetchBlockchainAddress', error);
        }
        yield put(fromGeneralActions.setLoading(false));
        try {
            yield call(fetchDataAfterConfigurationChange);
        } catch (error) {
            console.error('initializeEnvironment() error', error);
        }
    }
}

function* checkBlockchainNetwork(): SagaIterator {
    while (true) {
        yield take([UsersActions.setUserState, UsersActions.setUserOffchain]);

        const user = yield select(fromUsersSelectors.getUserOffchain);
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
                    NotificationTypeEnum.Error,
                    { timeOut: 10000 }
                );
            }
        }
    }
}

export function* generalSaga(): SagaIterator {
    yield all([
        fork(showAccountChangedModalOnChange),
        fork(setupEnvironment),
        fork(initializeClients),
        fork(fillOffchainConfiguration),
        fork(initializeEnvironment),
        fork(checkBlockchainNetwork)
    ]);
}
