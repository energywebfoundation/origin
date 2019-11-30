import React from 'react';
import { mount } from 'enzyme';
import { ProducingDeviceTable } from '../../components/ProducingDeviceTable';
import { dataTestSelector } from '../../utils/helper';
import { setupStore, WrapperComponent, createRenderedHelpers } from '../utils/helpers';

describe('ProducingDeviceTable', () => {
    it('correctly renders and search works', async () => {
        const { store, history, addProducingDevice } = setupStore();

        addProducingDevice({
            id: '0'
        });

        addProducingDevice({
            id: '1',
            facilityName: 'Biomass Energy Facility',
            deviceType: 'Gaseous;Agricultural gas',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            country: 'Thailand',
            capacityWh: 736123,
            lastSmartMeterReadWh: 312
        });

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <ProducingDeviceTable />
            </WrapperComponent>
        );

        const { refresh, assertPagination, assertMainTableContent } = createRenderedHelpers(
            rendered
        );

        await refresh();

        assertMainTableContent([
            'Example Organization',
            'Wuthering Heights facility',
            'Nakhon Pathom, Central',
            'Solar - Photovoltaic - Roof mounted',
            '9,876.543',
            '7.777',
            // next device
            'Example Organization',
            'Biomass Energy Facility',
            'Nakhon Pathom, Central',
            'Gaseous - Agricultural gas',
            '736.123',
            '0.312'
        ]);

        assertPagination(1, 2, 2);

        const searchInput = rendered.find(`${dataTestSelector('Search-textfield')} input`);

        searchInput.simulate('change', { target: { value: 'Biomass' } });

        await refresh();

        assertMainTableContent([
            'Example Organization',
            'Biomass Energy Facility',
            'Nakhon Pathom, Central',
            'Gaseous - Agricultural gas',
            '736.123',
            '0.312'
        ]);

        assertPagination(1, 1, 1);

        searchInput.simulate('change', { target: { value: 'Wuthering Heights' } });

        await refresh();

        assertMainTableContent([
            'Example Organization',
            'Wuthering Heights facility',
            'Nakhon Pathom, Central',
            'Solar - Photovoltaic - Roof mounted',
            '9,876.543',
            '7.777'
        ]);

        assertPagination(1, 1, 1);
    });
});
