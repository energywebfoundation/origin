import * as React from 'react';
import { mount } from 'enzyme';
import { CertificateTable, SelectedState } from '../components/CertificateTable';
import { Certificate } from '@energyweb/origin';
import { Unit } from '@energyweb/utils-general';
import {
    setupStore,
    createRenderedHelpers,
    DEFAULT_PRODUCING_ASSET_OFFCHAIN_PROPERTIES,
    WrapperComponent
} from './utils/helpers';

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

describe('CertificateTable', () => {
    afterAll(() => {
        jest.unmock('@energyweb/user-registry');
    });

    it('correctly renders', async () => {
        const { store, history, setCurrentUser, addProducingAsset, addCertificate } = setupStore();

        setCurrentUser({
            id: '0x123'
        });

        addProducingAsset({
            id: '0',
            owner: '0x123'
        });

        addCertificate({
            id: '0',
            owner: '0x123',
            energy: 1 * Unit.MWh,
            creationTime: 1569436970,
            assetId: 0,
            status: Certificate.Status.Active
        });

        addCertificate({
            id: '1',
            owner: '0x123',
            energy: 2.5 * Unit.kWh,
            creationTime: 1569746970,
            assetId: 0
        });

        addCertificate({
            id: '2',
            owner: '0x124'
        });

        addCertificate({
            id: '3',
            owner: '0x123',
            status: Certificate.Status.Retired
        });

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
            'Sep 19',
            `${DEFAULT_PRODUCING_ASSET_OFFCHAIN_PROPERTIES.address}, Thailand`,
            'IREC',
            'Example Organization',
            'Sun Sep 29 2019',
            '2.5',
            'ClaimPublish for sale',
            '',
            'Solar - Photovoltaic - Roof mounted',
            'Sep 19',
            `${DEFAULT_PRODUCING_ASSET_OFFCHAIN_PROPERTIES.address}, Thailand`,
            'IREC',
            'Example Organization',
            'Wed Sep 25 2019',
            '1,000',
            'ClaimPublish for sale'
        ]);

        assertPagination(1, 2, 2);
    });
});
