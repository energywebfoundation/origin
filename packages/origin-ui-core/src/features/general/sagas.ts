import { call, put, select, take, all, fork, cancelled, apply } from 'redux-saga/effects';
import { SagaIterator, eventChannel, EventChannel } from 'redux-saga';
import {
    setEnvironment,
    IEnvironment,
    GeneralActions,
    setOffChainDataSource,
    setExchangeClient,
    setOffchainConfiguration,
    setError,
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
    AccountAsset,
    Bundle
} from '../../utils/exchange';
import { IRecClient } from '../../utils/irec';
import {
    IOriginConfiguration,
    IUser,
    IOffChainDataSource,
    UserStatus
} from '@energyweb/origin-backend-core';
import {
    setActiveBlockchainAccountAddress,
    UsersActions,
    ISetActiveBlockchainAccountAddressAction
} from '../users/actions';
import { ethers, BigNumber } from 'ethers';
import { getSearch, push } from 'connected-react-router';
import { getConfiguration, getBaseURL, getWeb3 } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { Certificate, Contracts, CertificateUtils, ICertificate } from '@energyweb/issuer';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';
import { configurationUpdated } from '../actions';
import { ProducingDevice } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../producingDevices/actions';
import {
    addCertificate,
    requestCertificateEntityFetch,
    updateCertificate
} from '../certificates/actions';
import { IStoreState } from '../../types';
import { getI18n } from 'react-i18next';
import { showNotification, NotificationType, getDevicesOwnedLink } from '../../utils';
import { ICertificateViewItem, CertificateSource } from '../certificates';
import { getCertificate } from '../certificates/sagas';
import {
    storeBundle,
    BundlesActionType,
    ICreateBundleAction,
    showBundleDetails,
    clearBundles
} from '../bundles';
import { fetchOrders } from '../orders/sagas';
import { getUserOffchain } from '../users/selectors';
import { IProducingDeviceState } from '../producingDevices/reducer';

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
    }
}

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

function createConfiguration(
    account: string,
    web3: ethers.providers.JsonRpcProvider,
    offchainConfiguration: IOriginConfiguration,
    offChainDataSource: IOffChainDataSource,
    logger: Winston.Logger = Winston.createLogger({
        level: 'verbose',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    })
) {
    const signer = web3.getSigner(account);
    const { contractsLookup } = offchainConfiguration;

    const blockchainProperties: Configuration.BlockchainProperties = {
        registry: Contracts.factories.RegistryFactory.connect(contractsLookup.registry, signer),
        issuer: Contracts.factories.IssuerFactory.connect(contractsLookup.issuer, signer),
        web3,
        activeUser: signer
    };

    return {
        blockchainProperties,
        offChainDataSource,
        logger,
        deviceTypeService: new DeviceTypeService(offchainConfiguration.deviceTypes)
    };
}

async function initConf(
    routerSearch: string,
    offchainConfiguration: IOriginConfiguration,
    offChainDataSource: IOffChainDataSource,
    environmentWeb3: string
): Promise<IStoreState['configuration']> {
    let web3: ethers.providers.JsonRpcProvider = null;
    const params = queryString.parse(routerSearch);

    const ethereumProvider = (window as any).ethereum;

    if (params.rpc) {
        web3 = new ethers.providers.JsonRpcProvider(params.rpc as string);
    } else if (ethereumProvider) {
        web3 = new ethers.providers.Web3Provider(ethereumProvider);
        try {
            // Request account access if needed
            await ethereumProvider.enable();
        } catch (error) {
            // User denied account access...
        }
    } else if ((window as any).web3) {
        web3 = new ethers.providers.Web3Provider((window as any).web3.currentProvider);
    } else if (environmentWeb3) {
        web3 = new ethers.providers.JsonRpcProvider(environmentWeb3);
    }

    const accounts = await web3.listAccounts();

    return createConfiguration(accounts[0], web3, offchainConfiguration, offChainDataSource);
}

function createContractEventChannel(registry: any) {
    return eventChannel<BigNumber[]>((emitter) => {
        const onClaimSingle = (
            claimIssuer: string,
            claimSubject: string,
            topic: BigNumber,
            id: BigNumber
        ) => {
            emitter([id]);
        };

        const onClaimBatch = (
            claimIssuer: string,
            claimSubject: string,
            topics: BigNumber[],
            ids: BigNumber[]
        ) => {
            emitter(ids);
        };

        const onIssuanceSingle = async (sender: string, topic: BigNumber, id: BigNumber) => {
            emitter([id]);
        };

        registry
            .on('ClaimSingle', onClaimSingle)
            .on('ClaimBatch', onClaimBatch)
            .on('IssuanceSingle', onIssuanceSingle);

        return () => {
            registry
                .off('ClaimSingle', onClaimSingle)
                .off('ClaimBatch', onClaimBatch)
                .off('IssuanceSingle', onIssuanceSingle);
        };
    });
}

function* initEventHandler() {
    const configuration: IStoreState['configuration'] = yield select(getConfiguration);

    if (!configuration) {
        return;
    }

    const channel: EventChannel<BigNumber> = yield call(
        createContractEventChannel,
        configuration.blockchainProperties.registry
    );

    while (true) {
        const certificateIds: BigNumber[] = yield take(channel);

        for (const id of certificateIds) {
            if (id) {
                yield put(requestCertificateEntityFetch(id?.toNumber()));
            }
        }
    }
}

export function enhanceCertificate(
    { asset, amount }: AccountAsset,
    onChainCertificate: ICertificate
): ICertificateViewItem {
    return {
        ...onChainCertificate,
        energy: {
            publicVolume: BigNumber.from(amount),
            privateVolume: BigNumber.from(0),
            claimedVolume: BigNumber.from(0)
        },
        source: CertificateSource.Exchange,
        assetId: asset.id
    };
}

function* findEnhancedCertificate(
    asset: AccountAsset,
    onChainCertificates: ICertificateViewItem[]
) {
    const certificateId = parseInt(asset.asset.tokenId, 10);
    let onChainCertificate = onChainCertificates.find((c) => c.id === certificateId);

    if (!onChainCertificate) {
        onChainCertificate = yield call(getCertificate, certificateId);
    }

    return enhanceCertificate(asset, onChainCertificate);
}

export function* fetchBundles() {
    yield put(clearBundles());
    const exchangeClient: IExchangeClient = yield select(getExchangeClient);
    const bundles: Bundle[] = yield apply(exchangeClient, exchangeClient.getAvailableBundles, null);
    const user = yield select(getUserOffchain);
    const ownBundles: Bundle[] =
        user && user.status === UserStatus.Active
            ? yield apply(exchangeClient, exchangeClient.getOwnBundles, null)
            : [];
    for (const bundle of bundles) {
        bundle.own = ownBundles.find((b) => b.id === bundle.id) !== undefined;
        bundle.items.forEach((item) => {
            item.currentVolume = BigNumber.from(item.currentVolume.toString());
            item.startVolume = BigNumber.from(item.startVolume.toString());
        });
        if (
            bundle.items
                .reduce((total, item) => total.add(item.currentVolume), BigNumber.from(0))
                .isZero()
        ) {
            continue;
        }
        bundle.volume = BigNumber.from(bundle.volume.toString());
        yield put(storeBundle(bundle));
    }
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
            const web3: ethers.providers.Web3Provider = yield select(getWeb3);
            const activeUser = web3.getSigner(blockchainAccountAddress);
            const onChainCertificates: Certificate[] = yield apply(
                Certificate,
                CertificateUtils.getAllOwnedCertificates,
                [
                    {
                        ...configuration,
                        blockchainProperties: { ...configuration.blockchainProperties, activeUser }
                    }
                ]
            );
            const initializedCertificates = onChainCertificates
                .filter((cert) => cert.initialized)
                .map(
                    (c): ICertificateViewItem => ({
                        ...c,
                        isClaimed: c.isClaimed,
                        isOwned: c.isOwned,
                        source: CertificateSource.Blockchain
                    })
                );

            const exchangeClient: IExchangeClient = yield select(getExchangeClient);

            const offChainCertificates: ExchangeAccount = yield apply(
                exchangeClient,
                exchangeClient.getAccount,
                null
            );
            const available = yield all(
                offChainCertificates.balances.available.map((asset) =>
                    call(findEnhancedCertificate, asset, initializedCertificates)
                )
            );
            const certificates = initializedCertificates.concat(available);
            for (const certificate of certificates) {
                yield put(update ? updateCertificate(certificate) : addCertificate(certificate));
            }
        }
    }
    yield call(fetchBundles);
    yield call(fetchOrders);
}

function* fillContractLookupIfMissing(): SagaIterator {
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

        if (!offchainConfiguration.contractsLookup) {
            yield put(setError(ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS));
            yield put(setLoading(false));

            continue;
        }

        const routerSearch: string = yield select(getSearch);

        const configuration = yield call(
            initConf,
            routerSearch,
            offchainConfiguration,
            offChainDataSource,
            environment.WEB3
        );

        yield put(configurationUpdated(configuration));

        let userAddress: string;
        try {
            userAddress = yield apply(
                configuration.blockchainProperties.activeUser,
                configuration.blockchainProperties.activeUser.getAddress,
                []
            );

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
            yield call(initEventHandler);
        } catch (error) {
            console.error('fillContractLookupIfMissing() error', error);
        }
    }
}

function* updateConfigurationWhenUserChanged(): SagaIterator {
    while (true) {
        const { payload: address }: ISetActiveBlockchainAccountAddressAction = yield take(
            UsersActions.setActiveBlockchainAccountAddress
        );

        const existingConfiguration: Configuration.Entity = yield select(getConfiguration);
        const offchainConfiguration: IOriginConfiguration = yield select(getOffchainConfiguration);

        if (
            !existingConfiguration ||
            !offchainConfiguration ||
            !existingConfiguration?.blockchainProperties?.activeUser
        ) {
            continue;
        }

        const existingSignerAddress: string = yield call([
            existingConfiguration?.blockchainProperties?.activeUser,
            existingConfiguration?.blockchainProperties?.activeUser?.getAddress
        ]);

        if (address?.toLowerCase() === existingSignerAddress?.toLowerCase()) {
            continue;
        }

        const web3 = existingConfiguration?.blockchainProperties?.web3;
        const offChainDataSource = existingConfiguration?.offChainDataSource;

        const newConfiguration: Configuration.Entity = yield call(
            createConfiguration,
            address,
            web3 as ethers.providers.JsonRpcProvider,
            offchainConfiguration,
            offChainDataSource,
            existingConfiguration.logger
        );

        yield put(configurationUpdated(newConfiguration));
        yield call(fetchDataAfterConfigurationChange, newConfiguration, true);
    }
}

function* requestDeviceCreation() {
    while (true) {
        const {
            payload: { data, callback }
        }: IRequestDeviceCreationAction = yield take(GeneralActions.requestDeviceCreation);

        const configuration: Configuration.Entity = yield select(getConfiguration);
        const baseURL: string = yield select(getBaseURL);

        if (!configuration) {
            continue;
        }

        yield put(setLoading(true));

        const i18n = getI18n();

        try {
            const device = yield call(ProducingDevice.createDevice, data, configuration);

            yield put(producingDeviceCreatedOrUpdated(device));

            showNotification(i18n.t('device.feedback.deviceCreated'), NotificationType.Success);

            yield put(push(getDevicesOwnedLink(baseURL)));
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));

        yield call(callback);
    }
}

function* requestCreateBundle() {
    while (true) {
        const {
            payload: { bundleDTO, callback }
        }: ICreateBundleAction = yield take(BundlesActionType.CREATE);
        yield put(setLoading(true));
        const i18n = getI18n();
        const exchangeClient = yield select(getExchangeClient);
        try {
            yield apply(exchangeClient, exchangeClient.createBundle, [bundleDTO]);
            showNotification(
                i18n.t('certificate.feedback.bundle_created'),
                NotificationType.Success
            );
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
        yield call(fetchBundles);
        yield put(setLoading(false));
        yield call(callback);
    }
}

function* buyBundle() {
    while (true) {
        const {
            payload: { bundleDTO }
        } = yield take(BundlesActionType.BUY);
        yield put(setLoading(true));
        const i18n = getI18n();
        const exchangeClient = yield select(getExchangeClient);
        try {
            yield apply(exchangeClient, exchangeClient.buyBundle, [bundleDTO]);
            showNotification(
                i18n.t('certificate.feedback.bundle_bought'),
                NotificationType.Success
            );
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
        yield call(fetchBundles);
        yield put(setLoading(false));
        yield put(showBundleDetails(false));
    }
}

export function* generalSaga(): SagaIterator {
    yield all([
        fork(showAccountChangedModalOnChange),
        fork(setupEnvironment),
        fork(initializeOffChainDataSource),
        fork(fillOffchainConfiguration),
        fork(fillContractLookupIfMissing),
        fork(updateConfigurationWhenUserChanged),
        fork(requestDeviceCreation),
        fork(requestCreateBundle),
        fork(buyBundle)
    ]);
}
