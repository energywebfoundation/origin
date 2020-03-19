import { call, put, select, take, all, fork, apply, cancel } from 'redux-saga/effects';
import { SagaIterator, eventChannel } from 'redux-saga';
import { setContractsLookup } from './actions';
import { getSearch } from 'connected-react-router';
import { getConfiguration } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { Certificate, Registry, Issuer } from '@energyweb/issuer';
import { IOffChainDataSource, IConfigurationClient } from '@energyweb/origin-backend-client';
import {
    Configuration,
    ContractEventHandler,
    EventHandlerManager,
    DeviceTypeService
} from '@energyweb/utils-general';
import Web3 from 'web3';

import { configurationUpdated } from '../actions';
import { ProducingDevice } from '@energyweb/device-registry';
import {
    setError,
    setLoading,
    GeneralActions,
    IEnvironment,
    ISetOffChainDataSourceAction
} from '../general/actions';
import { producingDeviceCreatedOrUpdated } from '../producingDevices/actions';
import { addCertificate, requestCertificateEntityFetch } from '../certificates/actions';
import { IStoreState } from '../../types';
import { getOffChainDataSource, getEnvironment } from '../general/selectors';
import { getContractsLookup } from './selectors';
import { IContractsLookup } from '@energyweb/origin-backend-core';

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

async function initConf(
    contractsLookup: IContractsLookup,
    routerSearch: string,
    offChainDataSource: IOffChainDataSource,
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

    const blockchainProperties: Configuration.BlockchainProperties = {
        registry: new Registry(web3, contractsLookup.registry),
        issuer: new Issuer(web3, contractsLookup.issuer),
        web3
    };

    return {
        blockchainProperties,
        offChainDataSource,
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        }),
        deviceTypeService: new DeviceTypeService(
            (await offChainDataSource.configurationClient.get()).deviceTypes
        )
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

        const registryContractEventHandler: ContractEventHandler = new ContractEventHandler(
            configuration.blockchainProperties.registry,
            currentBlockNumber
        );

        const channel = eventChannel(emitter => {
            registryContractEventHandler.onEvent('ClaimSingle', async (event: any) => {
                const id = event.returnValues._id?.toString();

                if (typeof id !== 'string') {
                    return;
                }

                emitter({
                    action: requestCertificateEntityFetch(id)
                });
            });

            registryContractEventHandler.onEvent('IssuanceSingle', async (event: any) => {
                const id = event.returnValues._id?.toString();

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

        eventHandlerManager.registerEventHandler(registryContractEventHandler);
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

async function getContractsLookupFromAPI(configurationClient: IConfigurationClient) {
    try {
        return (await configurationClient.get())?.contractsLookup;
    } catch {
        return null;
    }
}

function* fillContractLookupIfMissing(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        let contractsLookup: IContractsLookup = yield select(getContractsLookup);

        const environment: IEnvironment = yield select(getEnvironment);

        const isContractsLookupFilled = Object.keys(contractsLookup).every(
            key => contractsLookup[key] !== null
        );

        if (isContractsLookupFilled || !environment) {
            continue;
        }

        let offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

        if (!offChainDataSource) {
            const action: ISetOffChainDataSourceAction = yield take(
                GeneralActions.setOffChainDataSource
            );

            offChainDataSource = action.payload;
        }

        if (!isContractsLookupFilled) {
            contractsLookup = yield call(
                getContractsLookupFromAPI,
                offChainDataSource.configurationClient
            );
        }

        if (contractsLookup) {
            yield put(setContractsLookup(contractsLookup));
        } else {
            yield put(setError(ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS));
            yield put(setLoading(false));

            continue;
        }

        const routerSearch: string = yield select(getSearch);

        let configuration: IStoreState['configuration'];
        try {
            configuration = yield call(
                initConf,
                contractsLookup,
                routerSearch,
                offChainDataSource,
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

            const certificates: Certificate.Entity[] = yield apply(
                Certificate,
                Certificate.getAllCertificates,
                [configuration]
            );

            for (const certificate of certificates) {
                yield put(addCertificate(certificate));
            }

            yield call(initEventHandler);
        } catch (error) {
            console.error('fillContractLookupIfMissing() error', error);
        }
    }
}

export function* contractsSaga(): SagaIterator {
    yield all([fork(fillContractLookupIfMissing)]);
}
