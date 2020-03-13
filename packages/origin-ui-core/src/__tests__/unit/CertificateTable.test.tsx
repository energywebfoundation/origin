import React from 'react';
import { mount } from 'enzyme';
import { CertificateTable, SelectedState } from '../../components/CertificateTable';
import { Certificate } from '@energyweb/origin';
import { Unit, DeviceTypeService, Configuration } from '@energyweb/utils-general';
import {
    setupStore,
    createRenderedHelpers,
    WrapperComponent,
    TEST_DEVICE_TYPES
} from '../utils/helpers';
import { IOrganizationWithRelationsIds, DeviceStatus } from '@energyweb/origin-backend-core';
import { IOrganizationClient, IOffChainDataSource } from '@energyweb/origin-backend-client';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';
import { configurationUpdated } from '../../features/actions';

describe('CertificateTable', () => {
    it('correctly renders', async () => {
        const offChainDataSource: IOffChainDataSource = new OffChainDataSourceMock();

        offChainDataSource.organizationClient = ({
            getById: async () =>
                (({ name: 'Example Organization' } as Partial<
                    IOrganizationWithRelationsIds
                >) as IOrganizationWithRelationsIds)
        } as Partial<IOrganizationClient>) as IOrganizationClient;

        await offChainDataSource.configurationClient.update({
            deviceTypes: JSON.stringify(TEST_DEVICE_TYPES)
        });

        const {
            store,
            history,
            setCurrentUser,
            addProducingDevice,
            addCertificate,
            cleanupStore
        } = setupStore(undefined, {
            offChainDataSource,
            mockUserFetcher: false,
            logActions: false
        });

        setCurrentUser({
            id: '0x123'
        });

        addProducingDevice({
            id: '0',
            owner: '0x123',
            status: DeviceStatus.Active
        });

        addCertificate({
            id: '0',
            certificate: {
                owner: '0x123',
                energy: 1 * Unit.MWh,
                creationTime: 1569436970,
                deviceId: 0,
                status: Certificate.Status.Active
            } as Certificate.ICertificate
        });

        addCertificate({
            id: '1',
            certificate: {
                owner: '0x123',
                energy: 2.5 * Unit.kWh,
                creationTime: 1569746970,
                deviceId: 0
            } as Certificate.ICertificate
        });

        addCertificate({
            id: '2',
            certificate: {
                owner: '0x124'
            } as Certificate.ICertificate
        });

        addCertificate({
            id: '3',
            certificate: {
                owner: '0x123',
                status: Certificate.Status.Claimed
            } as Certificate.ICertificate
        });

        store.dispatch(
            configurationUpdated(({
                deviceTypeService: new DeviceTypeService(TEST_DEVICE_TYPES)
            } as Partial<Configuration.Entity>) as Configuration.Entity)
        );

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <CertificateTable selectedState={SelectedState.Inbox} />
            </WrapperComponent>
        );

        const { refresh, assertPagination, assertMainTableContent } = createRenderedHelpers(
            rendered
        );

        await refresh();

        assertMainTableContent([
            '',
            'Solar - Photovoltaic - Roof mounted',
            'Sep 17th, 2019',
            `Central, Nakhon Pathom`,
            'I-REC',
            'Example Organization',
            'Sep 29th, 2019',
            '0.003',
            'ClaimPublish for sale',
            '',
            'Solar - Photovoltaic - Roof mounted',
            'Sep 17th, 2019',
            `Central, Nakhon Pathom`,
            'I-REC',
            'Example Organization',
            'Sep 25th, 2019',
            '1',
            'ClaimPublish for sale'
        ]);

        assertPagination(1, 2, 2);

        cleanupStore();
    });
});
