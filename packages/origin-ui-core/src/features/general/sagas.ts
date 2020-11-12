import { call, put, select, take, all, fork, cancelled, apply } from 'redux-saga/effects';
import { SagaIterator, eventChannel, EventChannel } from 'redux-saga';
import {
    setEnvironment,
    IEnvironment,
    GeneralActions,
    setOffChainDataSource,
    setExchangeClient,
    setOffchainConfiguration,
    setLoading,
    IRequestDeviceCreationAction,
    setIRecClient
} from './actions';
import {
    getEnvironment,
    getOffChainDataSource,
    getOffchainConfiguration,
    getExchangeClient
} from './selectors';
import axios, { Canceler } from 'axios';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import {
    ExchangeClient,
    IExchangeClient,
    ExchangeAccount,
    AccountAsset
} from '../../utils/exchange';
import { IRecClient } from '../../utils/irec';
import {
    IOriginConfiguration,
    IOffChainDataSource,
    UserStatus,
    IUser
} from '@energyweb/origin-backend-core';
import { BigNumber, ethers } from 'ethers';
import {
    CertificationRequestsClient,
    Configuration as ClientConfiguration,
    CertificatesClient
} from '@energyweb/issuer-api-client';

import { setActiveBlockchainAccountAddress } from '../users/actions';
import { getSearch, push } from 'connected-react-router';
import { getConfiguration, getBaseURL } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';
import { configurationUpdated, web3Updated } from '../actions';
import { ProducingDevice } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../producingDevices/actions';
import { getI18n } from 'react-i18next';
import { showNotification, NotificationType, getDevicesOwnedLink } from '../../utils';
import {
    ICertificateViewItem,
    CertificateSource,
    ICertificate,
    updateCertificate,
    addCertificate,
    setCertificatesClient,
    setCertificationRequestsClient
} from '../certificates';
import { getCertificate } from '../certificates/sagas';
import { getUserOffchain } from '../users/selectors';
import { IProducingDeviceState } from '../producingDevices/reducer';
import { getCertificatesClient } from '../certificates/selectors';
import { certificateEnergyStringToBN } from '../../utils/certificates';

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
                REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user'
            };
        },
        cancel: source.cancel
    };
}

async function getConfigurationFromAPI(
    offChainDataSource: IOffChainDataSource
): Promise<IOriginConfiguration> {
    try {
        return await offChainDataSource.configurationClient.get();
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
        yield take([GeneralActions.setEnvironment, GeneralActions.setOffChainDataSource]);

        const environment: IEnvironment = yield select(getEnvironment);
        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

        if (!environment || !offChainDataSource) {
            continue;
        }

        const configuration: IOriginConfiguration = yield call(
            getConfigurationFromAPI,
            offChainDataSource
        );

        yield put(setOffchainConfiguration({ configuration }));
    }
}

function* initializeOffChainDataSource(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);
        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

        if (!environment || offChainDataSource) {
            continue;
        }

        const newOffChainDataSource = new OffChainDataSource(
            environment.BACKEND_URL,
            Number(environment.BACKEND_PORT)
        );

        yield put(setOffChainDataSource(newOffChainDataSource));

        yield put(
            setExchangeClient({
                exchangeClient: new ExchangeClient(
                    newOffChainDataSource.dataApiUrl,
                    newOffChainDataSource.requestClient
                )
            })
        );

        yield put(
            setIRecClient({
                iRecClient: new IRecClient(
                    newOffChainDataSource.dataApiUrl,
                    newOffChainDataSource.requestClient
                )
            })
        );

        const clientConfiguration = new ClientConfiguration({
            baseOptions: {
                headers: {
                    Authorization: `Bearer ${newOffChainDataSource.requestClient.authenticationToken}`
                }
            },
            accessToken: newOffChainDataSource.requestClient.authenticationToken
        });
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

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
    offChainDataSource: IOffChainDataSource,
    logger: Winston.Logger = Winston.createLogger({
        level: 'verbose',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    })
) {
    return {
        offChainDataSource,
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
    let onChainCertificate = onChainCertificates.find((c) => c.id === certificateId);

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
        [configuration, true, false]
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

            const exchangeClient: IExchangeClient = yield select(getExchangeClient);

            const offChainCertificates: ExchangeAccount = yield apply(
                exchangeClient,
                exchangeClient.getAccount,
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
            GeneralActions.setOffChainDataSource,
            GeneralActions.setOffchainConfiguration
        ]);

        const environment: IEnvironment = yield select(getEnvironment);
        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);
        const offchainConfiguration: IOriginConfiguration = yield select(getOffchainConfiguration);

        if (!environment || !offChainDataSource || !offchainConfiguration) {
            continue;
        }

        const configuration: Configuration.Entity = yield call(
            createConfiguration,
            offchainConfiguration,
            offChainDataSource
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
        fork(initializeOffChainDataSource),
        fork(fillOffchainConfiguration),
        fork(initializeEnvironment),
        fork(requestDeviceCreation)
    ]);
}
