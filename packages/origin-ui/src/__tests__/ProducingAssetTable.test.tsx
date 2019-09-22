import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createMemoryHistory } from 'history';
import { createRootReducer } from '../reducers';
import { ProducingAssetTable } from '../components/ProducingAssetTable';
import { producingAssetCreatedOrUpdated } from '../features/producingAssets/actions';
import { ProducingAsset } from '@energyweb/asset-registry';
import { dataTestSelector } from '../utils/Helper';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import sagas from '../features/sagas';

const flushPromises = () => new Promise(setImmediate);

jest.mock('@energyweb/user-registry', () => {
    return {
        User: {
            Entity: class Entity {
                id: string;

                constructor(id: string) {
                    this.id = id;
                }

                sync() {
                    return {
                        id: this.id,
                        organization: 'Example Organization'
                    };
                }
            }
        }
    };
});

describe('ProducingAssetTable', () => {
    afterAll(() => {
        jest.unmock('@energyweb/user-registry');
    });

    it('correctly renders and search works', async () => {
        const history = createMemoryHistory();

        const sagaMiddleware = createSagaMiddleware();

        const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);

        const store = createStore(createRootReducer(history), middleware);

        Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
            sagaMiddleware.run(sagas[saga]);
        });

        const producingAssets: Array<Partial<ProducingAsset.Entity>> = [
            {
                id: '0',
                configuration: {
                    blockchainProperties: {
                        activeUser: {
                            address: '0x0'
                        }
                    } as any
                } as any,
                owner: {
                    address: '0x0'
                },
                offChainProperties: ({
                    facilityName: 'Wuthering Heights facility',
                    assetType: 'Solar',
                    city: 'Sopot',
                    country: 'Poland',
                    capacityWh: 9876543
                } as Partial<ProducingAsset.IOffChainProperties>) as any,
                lastSmartMeterReadWh: 7777
            },
            {
                id: '1',
                configuration: {
                    blockchainProperties: {
                        activeUser: {
                            address: '0x0'
                        }
                    } as any
                } as any,
                owner: {
                    address: '0x0'
                },
                offChainProperties: ({
                    facilityName: 'Biomass Energy Facility',
                    assetType: 'Gaseous;Agricultural gas',
                    city: 'Amsterdam',
                    country: 'Netherlands',
                    capacityWh: 736123
                } as Partial<ProducingAsset.IOffChainProperties>) as any,
                lastSmartMeterReadWh: 312
            }
        ];

        for (const asset of producingAssets) {
            store.dispatch(producingAssetCreatedOrUpdated(asset as ProducingAsset.Entity));
        }

        const rendered = mount(
            <Provider store={store}>
                <ProducingAssetTable />
            </Provider>
        );

        await flushPromises();

        const assertPagination = (firstIndex: number, lastIndex: number, total: number) => {
            expect(rendered.find('span.MuiTablePagination-caption').text()).toBe(
                `${firstIndex}-${lastIndex} of ${total}`
            );
        }

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            'Example Organization',
            'Wuthering Heights facility',
            'Sopot, Poland',
            'Solar',
            '9,876.543',
            '7.777',
            // next asset
            'Example Organization',
            'Biomass Energy Facility',
            'Amsterdam, Netherlands',
            'Gaseous;Agricultural gas',
            '736.123',
            '0.312'
        ]);

        assertPagination(1, 2, 2);

        const searchInput = rendered.find(`${dataTestSelector('Search-textfield')} input`);

        searchInput.simulate('change', { target: { value: 'Biomass' } });

        await flushPromises();

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            'Example Organization',
            'Biomass Energy Facility',
            'Amsterdam, Netherlands',
            'Gaseous;Agricultural gas',
            '736.123',
            '0.312'
        ]);

        assertPagination(1, 1, 1);

        searchInput.simulate('change', { target: { value: 'Wuthering Heights' } });

        await flushPromises();

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            'Example Organization',
            'Wuthering Heights facility',
            'Sopot, Poland',
            'Solar',
            '9,876.543',
            '7.777'
        ]);

        assertPagination(1, 1, 1);
    });
});
