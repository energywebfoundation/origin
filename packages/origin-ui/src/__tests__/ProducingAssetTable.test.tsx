import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createMemoryHistory } from 'history';
import { createRootReducer } from '../reducers';
import { ProducingAssetTable } from '../components/ProducingAssetTable';
import { producingAssetCreatedOrUpdated } from '../features/actions';
import { ProducingAsset } from '@energyweb/asset-registry';
import { dataTestSelector } from '../utils/Helper';

const flushPromises = () => new Promise(setImmediate);

jest.mock('@energyweb/user-registry', () => {
    return {
        User: {
            Entity: class Entity {
                sync() {
                    return {
                        organization: 'Example Organization'
                    }
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

        const store = createStore(createRootReducer(history));

        const producingAssets: Partial<ProducingAsset.Entity>[] = [
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
                offChainProperties: {
                    facilityName: 'Wuthering Heights facility',
                    assetType: ProducingAsset.Type.Solar,
                    city: 'Sopot',
                    country: 'Poland',
                    capacityWh: 9876543
                } as Partial<ProducingAsset.IOffChainProperties> as any,
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
                offChainProperties: {
                    facilityName: 'Biomass Energy Facility',
                    assetType: ProducingAsset.Type.BiomassGas,
                    city: 'Amsterdam',
                    country: 'Netherlands',
                    capacityWh: 736123
                } as Partial<ProducingAsset.IOffChainProperties> as any,
                lastSmartMeterReadWh: 312
            }
        ]

        for (const asset of producingAssets) {
            store.dispatch(producingAssetCreatedOrUpdated(asset as ProducingAsset.Entity));
        }

        const rendered = mount(
            <Provider store={store}>
                <ProducingAssetTable />
            </Provider>
        );

        await flushPromises();

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            '0',
            'Example Organization',
            'Wuthering Heights facility',
            'Sopot, Poland',
            'Solar',
            '9876.543',
            '7.777',
            '',
            // next asset
            "1",
            "Example Organization",
            "Biomass Energy Facility",
            "Amsterdam, Netherlands",
            "BiomassGas",
            "736.123",
            "0.312",
            ""
        ]);

        expect(rendered.find('table tfoot tr td').map(el => el.text())).toEqual([
            'Total', '8.089', ''
        ]);

        expect(rendered.find(dataTestSelector('pagination-helper-text')).text()).toBe('Showing 1 to 2 of 2 entries');

        const searchInput = rendered.find(`${dataTestSelector('Search-textfield')} input`);

        searchInput.simulate('change', { target: { value: 'Biomass' } })

        await flushPromises();

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            "1",
            "Example Organization",
            "Biomass Energy Facility",
            "Amsterdam, Netherlands",
            "BiomassGas",
            "736.123",
            "0.312",
            ""
        ]);

        expect(rendered.find(dataTestSelector('pagination-helper-text')).text()).toBe('Showing 1 to 1 of 1 entries');

        searchInput.simulate('change', { target: { value: 'Wuthering Heights' } })

        await flushPromises();

        rendered.update();

        expect(rendered.find('table tbody tr td').map(el => el.text())).toEqual([
            '0',
            'Example Organization',
            'Wuthering Heights facility',
            'Sopot, Poland',
            'Solar',
            '9876.543',
            '7.777',
            ''
        ]);

        expect(rendered.find(dataTestSelector('pagination-helper-text')).text()).toBe('Showing 1 to 1 of 1 entries');
    });
});
