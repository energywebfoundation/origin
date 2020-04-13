import { ethers } from 'ethers';
import { call, put, select, take, all, fork, apply, cancel } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { setContractsLookup } from './actions';
import { getSearch } from 'connected-react-router';
import { getConfiguration } from '../selectors';
import * as queryString from 'query-string';
import * as Winston from 'winston';
import { Certificate, Contracts, CertificateUtils } from '@energyweb/issuer';
import { IOffChainDataSource, IConfigurationClient } from '@energyweb/origin-backend-client';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';

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
import { IContractsLookup, IOrganizationWithRelationsIds } from '@energyweb/origin-backend-core';
import { addOrganizations, setActiveBlockchainAccountAddress } from '../users/actions';
import { BigNumber } from 'ethers/utils';

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

async function initConf(
    contractsLookup: IContractsLookup,
    routerSearch: string,
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
    const signer = web3.getSigner(accounts[0]);

    const blockchainProperties: Configuration.BlockchainProperties = {
        registry: Contracts.factories.RegistryFactory.connect(contractsLookup.registry, signer),
        issuer: Contracts.factories.IssuerFactory.connect(contractsLookup.issuer, signer),
        web3,
        activeUser: signer
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

    configuration.blockchainProperties.registry
        .on('ClaimSingle', async (event: any) => {
            const id = Number(event.returnValues._id);

            if (typeof id !== 'string') {
                return;
            }

            put(requestCertificateEntityFetch(id));
        })
        .on('IssuanceSingle', async (sender: string, topic: BigNumber, id: BigNumber) => {
            put(requestCertificateEntityFetch(id?.toNumber()));
        });
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
            (key) => contractsLookup[key] !== null
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

            const userAddress = yield apply(
                configuration.blockchainProperties.activeUser,
                configuration.blockchainProperties.activeUser.getAddress,
                []
            );

            yield put(configurationUpdated(configuration));
            yield put(setActiveBlockchainAccountAddress(userAddress));

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

            const certificates: Certificate[] = yield apply(
                Certificate,
                CertificateUtils.getAllCertificates,
                [configuration]
            );

            for (const certificate of certificates) {
                yield put(addCertificate(certificate));
            }

            const organizations: IOrganizationWithRelationsIds[] = yield apply(
                offChainDataSource.organizationClient,
                offChainDataSource.organizationClient.getAll,
                []
            );

            yield put(addOrganizations(organizations));

            yield call(initEventHandler);
        } catch (error) {
            console.error('fillContractLookupIfMissing() error', error);
        }
    }
}

export function* contractsSaga(): SagaIterator {
    yield all([fork(fillContractLookupIfMissing)]);
}
