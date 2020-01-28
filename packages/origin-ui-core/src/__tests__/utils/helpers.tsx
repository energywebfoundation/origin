import { createMemoryHistory } from 'history';
import createSagaMiddleware, { Task } from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createRootReducer } from '../../reducers';
import { sagas } from '../../features/sagas';
import { MarketUser, PurchasableCertificate } from '@energyweb/market';
import {
    addUser,
    updateCurrentUserId,
    updateFetcher,
    IUserFetcher
} from '../../features/users/actions';
import { ReactWrapper, CommonWrapper } from 'enzyme';
import { Configuration, Compliance, Countries } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';

import { ProducingDevice } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../../features/producingDevices/actions';
import { addCertificate } from '../../features/certificates/actions';
import { dataTestSelector, DATE_FORMAT_DMY } from '../../utils/helper';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import MomentUtils from '@date-io/moment';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import {
    IConfigurationClient,
    IOffChainDataClient,
    IOrganizationClient,
    IUserClient,
    IDeviceClient
} from '@energyweb/origin-backend-client';
import {
    setConfigurationClient,
    setOffChainDataClient,
    setOrganizationClient,
    setUserClient,
    setDeviceClient
} from '../../features/general/actions';
import { OriginConfigurationProvider, createOriginConfiguration } from '../../components';
import { IDevice } from '@energyweb/origin-backend-core';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(setImmediate);

export async function waitForConditionAndAssert(
    conditionCheckFunction: () => Promise<boolean> | boolean,
    assertFunction: () => Promise<void> | void,
    interval: number,
    timeout: number
): Promise<void> {
    let timePassed = 0;

    while (timePassed < timeout) {
        if (await conditionCheckFunction()) {
            await assertFunction();

            return;
        }

        await wait(interval);
        timePassed += interval;
    }

    await assertFunction();
}

const setupStoreInternal = (
    initialHistoryEntries: string[],
    logActions = false,
    configurationClient: IConfigurationClient,
    offChainDataClient: IOffChainDataClient,
    userClient: IUserClient,
    deviceClient: IDeviceClient,
    organizationClient: IOrganizationClient,
    runSagas = true
) => {
    const history = createMemoryHistory({
        initialEntries: initialHistoryEntries
    });

    const sagaMiddleware = createSagaMiddleware();

    const middlewareToApply = [routerMiddleware(history), sagaMiddleware];

    if (logActions) {
        const logger = createLogger({
            level: {
                prevState: false,
                nextState: false
            }
        });

        middlewareToApply.push(logger);
    }

    const middleware = applyMiddleware(...middlewareToApply);

    const store = createStore(createRootReducer(history), middleware);

    if (configurationClient) {
        store.dispatch(setConfigurationClient(configurationClient));
    }

    if (offChainDataClient) {
        store.dispatch(setOffChainDataClient(offChainDataClient));
    }

    if (userClient) {
        store.dispatch(setUserClient(userClient));
    }

    if (deviceClient) {
        store.dispatch(setDeviceClient(userClient));
    }

    if (organizationClient) {
        store.dispatch(setOrganizationClient(organizationClient));
    }

    const sagasTasks: Task[] = runSagas
        ? Object.keys(sagas).reduce((a, saga) => [...a, sagaMiddleware.run(sagas[saga])], [])
        : [];

    return {
        store,
        history,
        sagasTasks
    };
};

interface ICreateProducingDeviceProperties {
    id: string;
    owner?: string;
    facilityName?: string;
    deviceType?: string;
    address?: string;
    country?: string;
    capacityInW?: number;
    lastSmartMeterReadWh?: number;
    operationalSince?: number;
    complianceRegistry?: Compliance;
    region?: string;
    province?: string;
}

export const DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES = ({
    facilityName: 'Wuthering Heights facility',
    deviceType: 'Solar;Photovoltaic;Roof mounted',
    country: Countries.find(c => c.name === 'Thailand').id,
    address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
    capacityInW: 9876543,
    operationalSince: 1568746970,
    complianceRegistry: 'I-REC',
    region: 'Central',
    province: 'Nakhon Pathom'
} as Partial<IDevice>) as IDevice;

export const createProducingDevice = (
    properties: ICreateProducingDeviceProperties
): ProducingDevice.Entity => {
    const owner = properties.owner || '0x0';
    const lastSmartMeterReadWh = properties.lastSmartMeterReadWh || 7777;

    const offChainProperties: IDevice= {
        address: properties.address || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.address,
        facilityName:
            properties.facilityName || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.facilityName,
        deviceType:
            properties.deviceType || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.deviceType,
        capacityInW:
            properties.capacityInW || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.capacityInW,
        operationalSince:
            properties.operationalSince ||
            DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.operationalSince,
        complianceRegistry:
            properties.complianceRegistry ||
            DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.complianceRegistry,
        country: Countries.find(c => c.name === properties.country).id || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.country,
        gpsLatitude: '',
        gpsLongitude: '',
        timezone: 'Asia/Bangkok',
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        description: '',
        images: '',
        region: properties.region || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.region,
        province: properties.province || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.province
    };

    return {
        id: properties.id,
        configuration: {
            blockchainProperties: {
                activeUser: {
                    address: '0x0'
                }
            } as Configuration.BlockchainProperties
        } as Configuration.Entity,
        owner: {
            address: owner
        },
        offChainProperties,
        lastSmartMeterReadWh
    } as ProducingDevice.Entity;
};

interface ICreateCertificateProperties {
    id: string;
    certificate: Certificate.ICertificate;
}

export const createCertificate = (
    properties: ICreateCertificateProperties
): PurchasableCertificate.Entity => {
    const status =
        typeof properties.certificate.status === 'undefined'
            ? Certificate.Status.Active
            : properties.certificate.status;

    properties.certificate.status = status;

    return {
        id: properties.id,
        configuration: ({
            blockchainProperties: {
                activeUser: {
                    address: '0x0'
                }
            }
        } as Partial<Configuration.Entity>) as Configuration.Entity,
        certificate: properties.certificate
    } as PurchasableCertificate.Entity;
};

interface ISetupStoreOptions {
    mockUserFetcher: boolean;
    logActions: boolean;
    configurationClient?: IConfigurationClient;
    offChainDataClient?: IOffChainDataClient;
    userClient?: IUserClient;
    deviceClient?: IDeviceClient;
    organizationClient?: IOrganizationClient;
    runSagas?: boolean;
    userFetcher?: IUserFetcher;
}

const DEFAULT_SETUP_STORE_OPTIONS: ISetupStoreOptions = {
    mockUserFetcher: true,
    logActions: false,
    runSagas: true
};

export const setupStore = (
    initialHistoryEntries?: string[],
    options: ISetupStoreOptions = DEFAULT_SETUP_STORE_OPTIONS
) => {
    const { store, history, sagasTasks } = setupStoreInternal(
        initialHistoryEntries,
        options.logActions,
        options.configurationClient,
        options.offChainDataClient,
        options.userClient,
        options.deviceClient,
        options.organizationClient,
        options.runSagas
    );

    if (options.mockUserFetcher) {
        const mockUserFetcher = options.userFetcher || {
            async fetch(id: string) {
                return ({
                    id,
                    organization: 'Example Organization'
                } as Partial<MarketUser.Entity>) as MarketUser.Entity;
            }
        };

        store.dispatch(updateFetcher(mockUserFetcher));
    }

    return {
        store,
        setCurrentUser: (properties: ISetCurrentUserProperties) => {
            const user: Partial<MarketUser.Entity> = {
                id: properties.id,
                isRole: () => true
            };

            store.dispatch(addUser(user as MarketUser.Entity));

            store.dispatch(updateCurrentUserId(user.id));
        },
        addProducingDevice: (properties: ICreateProducingDeviceProperties) => {
            const entity = createProducingDevice(properties);
            store.dispatch(producingDeviceCreatedOrUpdated(entity));
        },
        addCertificate: (properties: ICreateCertificateProperties) => {
            const entity = createCertificate(properties);
            store.dispatch(addCertificate(entity));
        },
        history,
        sagasTasks,
        cleanupStore: () => {
            sagasTasks.map(task => task.cancel());
        }
    };
};

interface ISetCurrentUserProperties {
    id: string;
    organization?: string;
}

export const createRefreshFunction = (rendered: CommonWrapper) => async () => {
    await flushPromises();
    rendered.update();
};

interface IWrapperProps {
    store: ReturnType<typeof setupStoreInternal>['store'];
    history: ReturnType<typeof setupStoreInternal>['history'];
    children: React.ReactNode;
}

const originConfiguration = createOriginConfiguration();

export const WrapperComponent = (props: IWrapperProps) => {
    return (
        <OriginConfigurationProvider value={originConfiguration}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <Provider store={props.store}>
                    <ConnectedRouter history={props.history}>{props.children}</ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        </OriginConfigurationProvider>
    );
};

export const createRenderedHelpers = (rendered: ReactWrapper) => {
    const refresh = createRefreshFunction(rendered);

    return {
        assertPagination: (firstIndex: number, lastIndex: number, total: number) => {
            expect(rendered.find('p.MuiTablePagination-caption').text()).toBe(
                `${firstIndex}-${lastIndex} of ${total}`
            );
        },
        assertMainTableContent: (expected: string[]) => {
            expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual(expected);
        },
        refresh,
        fillInputField: (name: string, value: string) => {
            const input = rendered.find(`${dataTestSelector(name)} input`).hostNodes();
            const inputField = input.getDOMNode();

            const inputFieldName = inputField.getAttribute('name');

            input.simulate('change', { target: { value, name: inputFieldName } });
        },
        click: (dataTest: string) => {
            return rendered
                .find(`${dataTestSelector(dataTest)}`)
                .hostNodes()
                .simulate('click', {
                    button: 0
                });
        },
        submitForm: (dataTest: string) => {
            rendered
                .find(dataTestSelector(dataTest))
                .hostNodes()
                .simulate('submit');
        },
        fillDate: async (name: string, dayOfMonth: number) => {
            const now = moment();

            rendered.find(`div${dataTestSelector(name)}`).simulate('click');

            expect(document.querySelector('.MuiPickersToolbar-toolbar').textContent).toBe(
                now.format('YYYYddd, MMM D')
            );

            const daysElements = document.querySelectorAll(
                '.MuiPickersDay-day:not(.MuiPickersDay-hidden)'
            );
            (daysElements.item(dayOfMonth - 1) as HTMLElement).click();

            await refresh();

            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe(
                now
                    .clone()
                    .set('date', dayOfMonth)
                    .format(DATE_FORMAT_DMY)
            );

            // Close Datepicker (click outside)
            (document.querySelector('body > [role="presentation"] > div') as HTMLElement).click();

            await refresh();

            await waitForConditionAndAssert(
                () => document.querySelector('.MuiPickersToolbar-toolbar') === null,
                () => {
                    expect(document.querySelector('.MuiPickersToolbar-toolbar')).toBe(null);
                },
                10,
                100
            );
        },
        fillSelect: async (name: string, valueToSelect: string, labels: string[]) => {
            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe('');

            rendered.find(`#mui-component-select-${name}`).simulate('mousedown');

            expect(
                Array.from(document.querySelectorAll(`#menu-${name} ul li`)).map(i => i.textContent)
            ).toStrictEqual(labels);

            (document.querySelector(
                `#menu-${name} [data-value="${valueToSelect}"]`
            ) as HTMLElement).click();

            await refresh();

            expect(document.querySelector(`#menu-${name} [data-value="${valueToSelect}"]`)).toBe(
                null
            );

            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe(valueToSelect);
        }
    };
};
