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
import { Certificate } from '@energyweb/origin';
import { IOffChainDataClient, IConfigurationClient } from '@energyweb/origin-backend-client';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import Web3 from 'web3';
import {
    Demand,
    createBlockchainProperties as marketCreateBlockchainProperties
} from '@energyweb/market';
import {
    configurationUpdated,
    demandDeleted,
    consumingAssetCreatedOrUpdated,
    demandCreated
} from '../actions';
import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { BACKEND_URL } from '../../utils/api';
import { setError, setLoading } from '../general/actions';
import { producingAssetCreatedOrUpdated } from '../producingAssets/actions';
import { certificateCreatedOrUpdated } from '../certificates/actions';
import { IStoreState } from '../../types';
import { getOffChainDataClient, getConfigurationClient } from '../general/selectors';

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

async function initConf(
    marketContractLookupAddress: string,
    routerSearch: string,
    offChainDataClient: IOffChainDataClient
): Promise<Configuration.Entity> {
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
    } else if (process.env.WEB3) {
        web3 = new Web3(process.env.WEB3);
    }

    const blockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        marketContractLookupAddress
    );

    return {
        blockchainProperties,
        offChainDataSource: {
            baseUrl: `${BACKEND_URL}/api`,
            client: offChainDataClient
        },
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };
}

function* initEventHandler() {
    const configuration: Configuration.Entity = yield select(getConfiguration);

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

        const demandContractEventHandler: ContractEventHandler = new ContractEventHandler(
            configuration.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        const channel = eventChannel(emitter => {
            certificateContractEventHandler.onEvent('LogPublishForSale', async function(
                event: any
            ) {
                const certificate = await new Certificate.Entity(
                    event.returnValues._certificateId,
                    configuration
                ).sync();

                emitter({
                    action: certificateCreatedOrUpdated(certificate)
                });
            });

            certificateContractEventHandler.onEvent('LogCertificateSplit', async function(
                event: any
            ) {
                const certificate = await new Certificate.Entity(
                    event.returnValues._certificateId,
                    configuration
                ).sync();

                emitter({
                    action: certificateCreatedOrUpdated(certificate)
                });
            });

            certificateContractEventHandler.onEvent('LogCertificateClaimed', async function(
                event: any
            ) {
                const certificate = await new Certificate.Entity(
                    event.returnValues._certificateId,
                    configuration
                ).sync();

                emitter({
                    action: certificateCreatedOrUpdated(certificate)
                });
            });

            certificateContractEventHandler.onEvent('Transfer', async function(event: any) {
                const certificate = await new Certificate.Entity(
                    event.returnValues._tokenId,
                    configuration
                ).sync();

                emitter({
                    action: certificateCreatedOrUpdated(certificate)
                });
            });

            certificateContractEventHandler.onEvent('LogUnpublishForSale', async function(
                event: any
            ) {
                const certificate = await new Certificate.Entity(
                    event.returnValues._certificateId,
                    configuration
                ).sync();

                emitter({
                    action: certificateCreatedOrUpdated(certificate)
                });
            });

            demandContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
                const demand = await new Demand.Entity(
                    event.returnValues._demandId,
                    configuration
                ).sync();

                emitter({
                    action: demandCreated(demand)
                });
            });

            demandContractEventHandler.onEvent('DemandStatusChanged', async (event: any) => {
                if (event.returnValues._status === Demand.DemandStatus.ARCHIVED) {
                    emitter({
                        action: demandDeleted(
                            await new Demand.Entity(
                                event.returnValues._demandId,
                                configuration
                            ).sync()
                        )
                    });
                }
            });

            return () => {
                eventHandlerManager.stop();
            };
        });

        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.registerEventHandler(demandContractEventHandler);
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

async function getMarketContractLookupAddressFromAPI(configurationClient: IConfigurationClient) {
    try {
        const marketContracts: string[] = await configurationClient.get(
            `${BACKEND_URL}/api`,
            'MarketContractLookup'
        );

        if (marketContracts.length > 0) {
            return marketContracts[marketContracts.length - 1];
        }

        return null;
    } catch {
        return null;
    }
}

function* fillMarketContractLookupAddressIfMissing(): SagaIterator {
    const savedAddress = localStorage.getItem(MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY);
    let marketContractLookupAddress: string = savedAddress;

    if (!marketContractLookupAddress) {
        const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

        marketContractLookupAddress = yield call(
            getMarketContractLookupAddressFromAPI,
            configurationClient
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

        configuration = yield call(
            initConf,
            marketContractLookupAddress,
            routerSearch,
            offChainDataClient
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
        const producingAssets: ProducingAsset.Entity[] = yield apply(
            ProducingAsset,
            ProducingAsset.getAllAssets,
            [configuration]
        );

        for (const asset of producingAssets) {
            yield put(producingAssetCreatedOrUpdated(asset));
        }

        const consumingAssets: ConsumingAsset.Entity[] = yield apply(
            ConsumingAsset,
            ConsumingAsset.getAllAssets,
            [configuration]
        );

        for (const asset of consumingAssets) {
            yield put(consumingAssetCreatedOrUpdated(asset));
        }

        const demands: Demand.Entity[] = yield apply(Demand, Demand.getAllDemands, [configuration]);

        for (const demand of demands) {
            yield put(demandCreated(demand));
        }

        const certificates: Certificate.Entity[] = yield apply(
            Certificate,
            Certificate.getAllCertificates,
            [configuration]
        );

        for (const certificate of certificates) {
            yield put(certificateCreatedOrUpdated(certificate));
        }

        yield call(initEventHandler);
    } catch (error) {
        console.error('fillMarketContractLookupAddressIfMissing() error', error);
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
