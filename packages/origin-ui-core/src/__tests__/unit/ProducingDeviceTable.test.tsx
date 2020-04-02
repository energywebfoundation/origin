import React from 'react';
import { mount } from 'enzyme';
import { ProducingDeviceTable } from '../../components/ProducingDeviceTable';
import { dataTestSelector } from '../../utils/helper';
import {
    setupStore,
    WrapperComponent,
    createRenderedHelpers,
    TEST_DEVICE_TYPES
} from '../utils/helpers';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { IOffChainDataSource } from '@energyweb/origin-backend-client';
import { configurationUpdated } from '../../features';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

describe('ProducingDeviceTable', () => {
    it('correctly renders and search works', async () => {
        const offChainDataSource: IOffChainDataSource = new OffChainDataSourceMock();

        await offChainDataSource.configurationClient.update({
            deviceTypes: TEST_DEVICE_TYPES
        });

        const { store, history, addProducingDevice } = setupStore(undefined, {
            offChainDataSource,
            mockUserFetcher: false,
            logActions: false
        });

        addProducingDevice({
            id: 0,
            status: DeviceStatus.Active,
            lastSmartMeterReadWh: 7777
        });

        addProducingDevice({
            id: 1,
            status: DeviceStatus.Active,
            facilityName: 'Biomass Energy Facility',
            deviceType: 'Gaseous;Agricultural gas',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            country: 'Thailand',
            capacityInW: 736123,
            region: 'Central',
            province: 'Nakhon Pathom'
        });

        store.dispatch(
            configurationUpdated(({
                deviceTypeService: new DeviceTypeService(TEST_DEVICE_TYPES)
            } as Partial<Configuration.Entity>) as Configuration.Entity)
        );

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <ProducingDeviceTable
                    hiddenColumns={['status']}
                    actions={{
                        requestCertificates: true
                    }}
                />
            </WrapperComponent>
        );

        const { refresh, assertPagination, assertMainTableContent } = createRenderedHelpers(
            rendered
        );

        await refresh();

        assertMainTableContent([
            '',
            'Wuthering Heights facility',
            'Central, Nakhon Pathom',
            'Solar - Photovoltaic - Roof mounted',
            '9.877',
            '0.008',
            // next device
            '',
            'Biomass Energy Facility',
            'Central, Nakhon Pathom',
            'Gaseous - Agricultural gas',
            '0.736',
            '0'
        ]);

        assertPagination(1, 2, 2);

        const searchInput = rendered.find(
            `${dataTestSelector(`Search by facility name and organization-textfield`)} input`
        );

        searchInput.simulate('change', { target: { value: 'Biomass' } });

        await refresh();

        assertMainTableContent([
            '',
            'Biomass Energy Facility',
            'Central, Nakhon Pathom',
            'Gaseous - Agricultural gas',
            '0.736',
            '0'
        ]);

        assertPagination(1, 1, 1);

        searchInput.simulate('change', { target: { value: 'Wuthering Heights' } });

        await refresh();

        assertMainTableContent([
            '',
            'Wuthering Heights facility',
            'Central, Nakhon Pathom',
            'Solar - Photovoltaic - Roof mounted',
            '9.877',
            '0.008'
        ]);

        assertPagination(1, 1, 1);
    });
});
