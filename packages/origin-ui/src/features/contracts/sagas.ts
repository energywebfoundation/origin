import { call, put, select, take, all, fork, apply, cancel, takeEvery } from 'redux-saga/effects';
import { SagaIterator, eventChannel } from 'redux-saga';
import {
    setMarketContractLookupAddress,
    ContractsActions,
    ISetMarketContractLookupAddressAction,
    MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY
} from './actions';
import { getSearch } from 'connected-react-router';
import { getConfiguration } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import {
    PurchasableCertificate,
    Demand,
    createBlockchainProperties as marketCreateBlockchainProperties
} from '@energyweb/market';
import { IOffChainDataClient, IConfigurationClient } from '@energyweb/origin-backend-client';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import Web3 from 'web3';

import {
    configurationUpdated,
    consumingDeviceCreatedOrUpdated,
    demandCreated,
    demandUpdated
} from '../actions';
import { ProducingDevice, ConsumingDevice } from '@energyweb/device-registry';
import { setError, setLoading, GeneralActions, IEnvironment } from '../general/actions';
import { producingDeviceCreatedOrUpdated } from '../producingDevices/actions';
import { addCertificate, requestCertificateEntityFetch } from '../certificates/actions';
import { IStoreState } from '../../types';
import {
    getOffChainDataClient,
    getConfigurationClient,
    getEnvironment
} from '../general/selectors';
import { getMarketContractLookupAddress } from './selectors';

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

async function initConf(
    marketContractLookupAddress: string,
    routerSearch: string,
    offChainDataClient: IOffChainDataClient,
    configurationClient: IConfigurationClient,
    baseURL: string,
    environmentWeb3: string
): Promise<IStoreState['configuration']> {
    let web3: Web3 = null;
    const params = queryString.parse(routerSearch);

    const ethereumProvider = (window as any).ethereum;

    if (params.rpc) {
        web3 = new Web3(params.rpc as string);
    } else if (ethereumProvider) {
        web3 = new Web3(ethereumProvider);
        try {
            // Request account access if needed
            await ethereumProvider.enable();
        } catch (error) {
            // User denied account access...
        }
    } else if ((window as any).web3) {
        web3 = new Web3(web3.currentProvider);
    } else if (environmentWeb3) {
        web3 = new Web3(environmentWeb3);
    }

    const blockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        marketContractLookupAddress
    );

    return {
        blockchainProperties,
        offChainDataSource: {
            baseUrl: baseURL,
            client: offChainDataClient,
            configurationClient
        },
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };
}

function* initEventHandler() {
    const configuration: IStoreState['configuration'] = yield select(getConfiguration);

    if (!configuration) {
        return;
    }

    try {
        const currentBlockNumber: number = yield call(
            configuration.blockchainProperties.web3.eth.getBlockNumber
        );

        const eventHandlerManager: EventHandlerManager = new EventHandlerManager(
            4000,
            configuration
        );

        const certificateContractEventHandler: ContractEventHandler = new ContractEventHandler(
            configuration.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        const marketContractEventHandler: ContractEventHandler = new ContractEventHandler(
            configuration.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        const channel = eventChannel(emitter => {
            marketContractEventHandler.onEvent('LogPublishForSale', async function(event: any) {
                const id = event.returnValues._certificateId?.toString();

                if (typeof id === 'undefined') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            marketContractEventHandler.onEvent('LogUnpublishForSale', async function(event: any) {
                const id = event.returnValues._certificateId?.toString();

                if (typeof id !== 'string') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            marketContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
                try {
                    const demand = await new Demand.Entity(
                        event.returnValues._demandId.toString(),
                        configuration
                    ).sync();

                    emitter({
                        action: demandCreated(demand)
                    });
                } catch (error) {
                    console.error(`Error while handling "createdNewDemand" event`, error);
                }
            });

            marketContractEventHandler.onEvent('DemandStatusChanged', async (event: any) => {
                if (
                    parseInt(event.returnValues._status as string, 10) ===
                    Demand.DemandStatus.ARCHIVED
                ) {
                    emitter({
                        action: demandUpdated(
                            await new Demand.Entity(
                                event.returnValues._demandId.toString(),
                                configuration
                            ).sync()
                        )
                    });
                }
            });

            certificateContractEventHandler.onEvent('LogCertificateSplit', async function(
                event: any
            ) {
                const id = event.returnValues._certificateId?.toString();

                if (typeof id !== 'string') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            certificateContractEventHandler.onEvent('LogCertificateClaimed', async function(
                event: any
            ) {
                const id = event.returnValues._certificateId?.toString();

                if (typeof id !== 'string') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            certificateContractEventHandler.onEvent('Transfer', async function(event: any) {
                const id = event.returnValues.tokenId?.toString();

                if (typeof id !== 'string') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            return () => {
                eventHandlerManager.stop();
            };
        });

        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.start();

        while (true) {
            const { action } = yield take(channel);

            if (!action) {
                break;
            }

            yield put(action);
        }
    } catch (error) {
        console.error('initEventHandler() error', error);
    }
}

async function getMarketContractLookupAddressFromAPI(
    configurationClient: IConfigurationClient,
    baseURL: string
) {
    try {
        const marketContracts = await configurationClient.get(baseURL, 'MarketContractLookup');

        if (marketContracts.length > 0) {
            return marketContracts[marketContracts.length - 1];
        }

        return null;
    } catch {
        return null;
    }
}

function* fillMarketContractLookupAddressIfMissing(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        let marketContractLookupAddress: string = localStorage.getItem(
            MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY
        );

        const existingMartketContractLookupAddress: string = yield select(
            getMarketContractLookupAddress
        );

        const environment: IEnvironment = yield select(getEnvironment);

        if (existingMartketContractLookupAddress || !environment) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        if (!marketContractLookupAddress) {
            const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

            marketContractLookupAddress = yield call(
                getMarketContractLookupAddressFromAPI,
                configurationClient,
                baseURL
            );
        }

        if (marketContractLookupAddress) {
            yield put(
                setMarketContractLookupAddress({
                    address: marketContractLookupAddress
                })
            );
        } else {
            yield put(setError(ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS));
            yield put(setLoading(false));

            return;
        }

        const routerSearch: string = yield select(getSearch);

        let configuration: IStoreState['configuration'];
        try {
            const offChainDataClient: IOffChainDataClient = yield select(getOffChainDataClient);
            const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

            configuration = yield call(
                initConf,
                marketContractLookupAddress,
                routerSearch,
                offChainDataClient,
                configurationClient,
                baseURL,
                environment.WEB3
            );

            yield put(configurationUpdated(configuration));

            yield put(setLoading(false));
        } catch (error) {
            console.error('ContractsSaga::WrongNetwork', error);
            yield put(setError(ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS));
            yield put(setLoading(false));

            yield cancel();
        }

        try {
            const producingDevices: ProducingDevice.Entity[] = yield apply(
                ProducingDevice,
                ProducingDevice.getAllDevices,
                [configuration]
            );

            for (const device of producingDevices) {
                yield put(producingDeviceCreatedOrUpdated(device));
            }

            const consumingDevices: ConsumingDevice.Entity[] = yield apply(
                ConsumingDevice,
                ConsumingDevice.getAllDevices,
                [configuration]
            );

            for (const device of consumingDevices) {
                yield put(consumingDeviceCreatedOrUpdated(device));
            }

            const demands: Demand.Entity[] = yield apply(Demand, Demand.getAllDemands, [
                configuration
            ]);

            for (const demand of demands) {
                yield put(demandCreated(demand));
            }

            const certificates: PurchasableCertificate.Entity[] = yield apply(
                PurchasableCertificate,
                PurchasableCertificate.getAllCertificates,
                [configuration]
            );

            for (const certificate of certificates) {
                yield put(addCertificate(certificate));
            }

            yield call(initEventHandler);
        } catch (error) {
            console.error('fillMarketContractLookupAddressIfMissing() error', error);
        }
    }
}

function* persistUserDefinedMarketLookupContract(): SagaIterator {
    yield takeEvery(ContractsActions.setMarketContractLookupAddress, function*(
        action: ISetMarketContractLookupAddressAction
    ) {
        if (action.payload.userDefined) {
            localStorage.setItem(
                MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY,
                action.payload.address
            );
        }
        yield;
    });
}

export function* contractsSaga(): SagaIterator {
    yield all([
        fork(fillMarketContractLookupAddressIfMissing),
        fork(persistUserDefinedMarketLookupContract)
    ]);
}
