import { createMemoryHistory } from 'history';
import createSagaMiddleware, { Task } from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createRootReducer } from '../../reducers';
import { sagas } from '../../features/sagas';
import { ReactWrapper, CommonWrapper } from 'enzyme';
import { Compliance, Configuration } from '@energyweb/utils-general';

import { producingDeviceCreatedOrUpdated } from '../../features/producingDevices/actions';
import { dataTestSelector, DATE_FORMAT_DMY, moment } from '../../utils';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import MomentUtils from '@date-io/moment';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { setOffChainDataSource } from '../../features/general/actions';
import {
    OriginConfigurationProvider,
    createOriginConfiguration,
    initializeI18N
} from '../../components';
import {
    IDevice,
    DeviceStatus,
    ISmartMeterReadStats,
    IOffChainDataSource,
    IPublicOrganization
} from '@energyweb/origin-backend-core';
import { BigNumber, Signer } from 'ethers';
import { ICertificate, Certificate } from '@energyweb/issuer';
import { IProducingDeviceState } from '../../features/producingDevices/reducer';

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(setImmediate);

export const TEST_DEVICE_TYPES = [
    ['Solar'],
    ['Solar', 'Photovoltaic'],
    ['Solar', 'Photovoltaic', 'Roof mounted'],
    ['Solar', 'Photovoltaic', 'Ground mounted'],
    ['Solar', 'Photovoltaic', 'Classic silicon'],
    ['Solar', 'Concentration'],
    ['Wind'],
    ['Wind', 'Onshore'],
    ['Wind', 'Offshore'],
    ['Hydro-electric Head'],
    ['Hydro-electric Head', 'Run-of-river head installation'],
    ['Hydro-electric Head', 'Storage head installation'],
    ['Hydro-electric Head', 'Pure pumped storage head installation'],
    ['Hydro-electric Head', 'Mixed pumped storage head'],
    ['Marine'],
    ['Marine', 'Tidal'],
    ['Marine', 'Tidal', 'Inshore'],
    ['Marine', 'Tidal', 'Offshore'],
    ['Marine', 'Wave'],
    ['Marine', 'Wave', 'Onshore'],
    ['Marine', 'Wave', 'Offshore'],
    ['Marine', 'Currents'],
    ['Marine', 'Pressure'],
    ['Marine', 'Thermal'],
    ['Solid'],
    ['Solid', 'Muncipal waste'],
    ['Solid', 'Muncipal waste', 'Biogenic'],
    ['Solid', 'Industrial and commercial waste'],
    ['Solid', 'Industrial and commercial waste', 'Biogenic'],
    ['Solid', 'Wood'],
    ['Solid', 'Wood', 'Forestry products'],
    ['Solid', 'Wood', 'Forestry by-products & waste'],
    ['Solid', 'Animal fats'],
    ['Solid', 'Biomass from agriculture'],
    ['Solid', 'Biomass from agriculture', 'Agricultural products'],
    ['Solid', 'Biomass from agriculture', 'Agricultural by-products & waste'],
    ['Liquid'],
    ['Liquid', 'Municipal biodegradable waste'],
    ['Liquid', 'Black liquor'],
    ['Liquid', 'Pure plant oil'],
    ['Liquid', 'Waste plant oil'],
    ['Liquid', 'Refined vegetable oil'],
    ['Liquid', 'Refined vegetable oil', 'Biodiesel (mono-alkyl ester)'],
    ['Liquid', 'Refined vegetable oil', 'Biogasoline (C6-C12 hydrocarbon)'],
    ['Gaseous'],
    ['Gaseous', 'Landfill gas'],
    ['Gaseous', 'Sewage gas'],
    ['Gaseous', 'Agricultural gas'],
    ['Gaseous', 'Agricultural gas', 'Animal manure'],
    ['Gaseous', 'Agricultural gas', 'Energy crops'],
    ['Gaseous', 'Gas from organic waste digestion'],
    ['Gaseous', 'Process gas'],
    ['Gaseous', 'Process gas', 'Biogenic'],
    ['Thermal'],
    ['Thermal', 'Internal combustion engine'],
    ['Thermal', 'Internal combustion engine', 'Non CHP'],
    ['Thermal', 'Internal combustion engine', 'CHP'],
    ['Thermal', 'Steam turbine with condensation turbine'],
    ['Thermal', 'Steam turbine with condensation turbine', 'Non CHP']
];

export const TEST_REGIONS = {
    Northeast: [
        'Amnat Charoen',
        'Bueng Kan, Buri Ram',
        'Chaiyaphum, Kalasin',
        'Khon Kaen, Loei',
        'Maha Sarakham',
        'Mukdahan',
        'Nakhon Phanom',
        'Nakhon Ratchasima',
        'Nong Bua Lamphu',
        'Nong Khai',
        'Roi Et',
        'Sakon Nakhon',
        'Si Sa Ket',
        'Surin',
        'Ubon Ratchathani',
        'Udon Thani',
        'Yasothon'
    ],
    North: [
        'Chiang Mai',
        'Chiang Rai',
        'Lampang',
        'Lamphun',
        'Mae Hong Son',
        'Nan',
        'Phayao',
        'Phrae',
        'Uttaradit'
    ],
    West: ['Tak', 'Kanchanaburi', 'Ratchaburi', 'Phetchaburi', 'Prachuap Khiri Khan'],
    Central: [
        'Sukhothai',
        'Phitsanulok',
        'Phichit',
        'Kamphaeng Phet',
        'Phetchabun',
        'Nakhon Sawan',
        'Uthai Thani',
        'Ang Thong',
        'Phra Nakhon Si Ayutthaya',
        'Bangkok, Chai Nat',
        'Lop Buri',
        'Nakhon Pathom',
        'Nonthaburi',
        'Pathum Thani',
        'Samut Prakan',
        'Samut Sakhon',
        'Samut Songkhram',
        'Saraburi',
        'Sing Buri',
        'Suphan Buri',
        'Nakhon Nayok'
    ],
    East: ['Chachoengsao', 'Chanthaburi', 'Chon Buri', 'Prachin Buri', 'Rayong', 'Sa Kaeo', 'Trat'],
    South: [
        'Chumphon',
        'Nakhon Si Thammarat',
        'Narathiwat',
        'Pattani',
        'Phatthalung',
        'Songkhla',
        'Surat Thani',
        'Yala',
        'Krabi',
        'Phang Nga',
        'Phuket',
        'Ranong',
        'Satun',
        'Trang'
    ]
};

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
    offChainDataSource: IOffChainDataSource,
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

    if (offChainDataSource) {
        store.dispatch(setOffChainDataSource(offChainDataSource));
    }

    const sagasTasks: Task[] = runSagas
        ? Object.keys(sagas).reduce((a, saga) => [...a, sagaMiddleware.run(sagas[saga])], [])
        : [];

    initializeI18N('en');

    return {
        store,
        history,
        sagasTasks
    };
};

interface ICreateProducingDeviceProperties {
    id: number;
    status: DeviceStatus;
    owner?: string;
    facilityName?: string;
    deviceType?: string;
    address?: string;
    country?: string;
    capacityInW?: number;
    meterStats?: ISmartMeterReadStats;
    operationalSince?: number;
    complianceRegistry?: Compliance;
    region?: string;
    province?: string;
    organization: IPublicOrganization;
}

export const DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES = ({
    status: DeviceStatus.Active,
    facilityName: 'Wuthering Heights facility',
    deviceType: 'Solar;Photovoltaic;Roof mounted',
    country: 'Thailand',
    address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
    capacityInW: 9876543,
    operationalSince: 1568746970,
    complianceRegistry: 'I-REC',
    region: 'Central',
    province: 'Nakhon Pathom'
} as Partial<IDevice>) as IDevice;

export const createProducingDevice = (
    properties: ICreateProducingDeviceProperties
): IProducingDeviceState => {
    const owner = properties.owner || '0x0';
    const meterStats = properties.meterStats ?? {
        certified: BigNumber.from(0),
        uncertified: BigNumber.from(0)
    };

    const offChainProperties = {
        status: properties.status || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.status,
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
        country: properties.country || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.country,
        gpsLatitude: '',
        gpsLongitude: '',
        timezone: 'Asia/Bangkok',
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        description: '',
        images: '',
        region: properties.region || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.region,
        province: properties.province || DEFAULT_PRODUCING_DEVICE_OFFCHAIN_PROPERTIES.province,
        organization: properties.organization
    };

    return ({
        id: properties.id,
        configuration: ({
            blockchainProperties: ({
                activeUser: {
                    getAddress: async () => '0x0'
                } as Partial<Signer>
            } as Partial<Configuration.BlockchainProperties>) as Configuration.BlockchainProperties
        } as Partial<Configuration.Entity>) as Configuration.Entity,
        owner: {
            address: owner
        },
        ...offChainProperties,
        meterStats
    } as Partial<IProducingDeviceState>) as IProducingDeviceState;
};

export const createCertificate = (certificate: ICertificate): Certificate => {
    return {
        id: certificate.id,
        configuration: ({
            blockchainProperties: {
                activeUser: {
                    getAddress: async () => '0x0'
                } as Partial<Signer>
            }
        } as Partial<Configuration.Entity>) as Configuration.Entity,
        ...certificate
    } as Certificate;
};

interface ISetupStoreOptions {
    mockUserFetcher: boolean;
    logActions: boolean;
    offChainDataSource?: IOffChainDataSource;
    runSagas?: boolean;
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
        options.offChainDataSource,
        options.runSagas
    );

    return {
        store,
        addProducingDevice: (properties: ICreateProducingDeviceProperties) => {
            const entity = createProducingDevice(properties);
            store.dispatch(producingDeviceCreatedOrUpdated(entity));
        },
        history,
        sagasTasks,
        cleanupStore: () => {
            sagasTasks.map((task) => task.cancel());
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
            expect(rendered.find('table tbody tr td').map((el) => el.text())).toEqual(expected);
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
            rendered.find(dataTestSelector(dataTest)).hostNodes().simulate('submit');
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
            ).toBe(now.clone().set('date', dayOfMonth).format(DATE_FORMAT_DMY));

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
                Array.from(document.querySelectorAll(`#menu-${name} ul li`)).map(
                    (i) => i.textContent
                )
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
