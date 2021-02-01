import React from 'react';
import { mount } from 'enzyme';
import { ProducingDeviceTable } from '../../components/devices/ProducingDevice/ProducingDeviceTable';
import { BackendClient, dataTestSelector } from '../../utils';
import {
    setupStore,
    WrapperComponent,
    createRenderedHelpers,
    TEST_DEVICE_TYPES
} from '../utils/helpers';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { configurationUpdated } from '../../features';
import { DeviceTypeService } from '@energyweb/utils-general';
import { Configuration } from '@energyweb/device-registry';
import { BigNumber } from 'ethers';

describe('ProducingDeviceTable', () => {
    it('correctly renders and search works', async () => {
        const { store, history, addProducingDevice } = setupStore(undefined, {
            backendClient: new BackendClient(
                `${process.env.BACKEND_URL}:${process.env.BACKEND_PORT}`
            ),
            mockUserFetcher: false,
            logActions: false
        });

        const testOrganizationName = 'Test organization name';

        addProducingDevice({
            id: 0,
            status: DeviceStatus.Active,
            meterStats: {
                uncertified: BigNumber.from(7777),
                certified: BigNumber.from(0)
            },
            organizationId: 0
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
            province: 'Nakhon Pathom',
            organizationId: 1
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
            testOrganizationName,
            'Wuthering Heights facility',
            'Solar - Photovoltaic - Roof mounted',
            '9.877',
            '0',
            '0.777',
            'View details',
            // next device
            testOrganizationName,
            'Biomass Energy Facility',
            'Gaseous - Agricultural gas',
            '0.736',
            '0',
            '0',
            'View details'
        ]);

        assertPagination(1, 2, 2);

        const searchInput = rendered.find(
            `${dataTestSelector(`Search by facility name and organization-textfield`)} input`
        );

        searchInput.simulate('change', { target: { value: 'Biomass' } });

        await refresh();

        assertMainTableContent([
            testOrganizationName,
            'Biomass Energy Facility',
            'Gaseous - Agricultural gas',
            '0.736',
            '0',
            '0',
            'View details'
        ]);

        assertPagination(1, 1, 1);

        searchInput.simulate('change', { target: { value: 'Wuthering Heights' } });

        await refresh();

        assertMainTableContent([
            testOrganizationName,
            'Wuthering Heights facility',
            'Solar - Photovoltaic - Roof mounted',
            '9.877',
            '0',
            '0.777',
            'View details'
        ]);

        assertPagination(1, 1, 1);
    });
});
