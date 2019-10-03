import * as React from 'react';
import { mount } from 'enzyme';
import { AppContainer } from '../components/AppContainer';
import { Route } from 'react-router-dom';
import { WrapperComponent, setupStore, wait, createRenderedHelpers } from './utils/helpers';
import { startGanache, deployDemo } from './utils/demo';
import { startAPI } from '@energyweb/utils-testbackend/dist/js/src/api';

jest.setTimeout(80000);

let ganacheServer;
let apiServer;

describe('Application[E2E]', () => {
    let CONTRACT;

    beforeAll(async () => {
        apiServer = await startAPI();
        ganacheServer = await startGanache();
        const { deployResult } = await deployDemo();

        CONTRACT = deployResult.marketContractLookup;
    });

    it('correctly navigates to producing asset details', async () => {
        const { store, history } = setupStore([`/${CONTRACT}/assets/?rpc=http://localhost:8545`], {
            mockUserFetcher: false
        });

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <Route path="/" component={AppContainer} />
            </WrapperComponent>
        );

        const { assertMainTableContent, assertPagination } = createRenderedHelpers(rendered);

        await wait(10000);

        rendered.update();

        expect(rendered.find('.ViewProfile').text()).toBe('admin');

        assertMainTableContent([
            'Asset Manager organization',
            'Wuthering Heights Windfarm',
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140, Thailand',
            'Wind',
            '0',
            '0'
        ]);

        assertPagination(1, 1, 1);

        // Go to asset details
        rendered
            .find('table tbody tr td')
            .first()
            .simulate('click');

        rendered.update();

        expect(rendered.find('table tbody tr td div').map(el => el.text())).toEqual([
            'Facility Name',
            'Wuthering Heights Windfarm ',
            'Asset Owner',
            ' ',
            'Certified by Registry (private)',
            'IREC ',
            'Other Green Attributes (private)',
            ' ',
            'Asset Type',
            'Wind ',
            '',
            'Meter Read',
            '0 kWh',
            'Public Support (private)',
            ' ',
            'Commissioning Date (private)',
            'Jan 70 ',
            'Nameplate Capacity (private)',
            '0 kW',
            'Geo Location (private)',
            ',  ',
            '',
            ''
        ]);

        rendered.unmount();

        await ganacheServer.close();

        apiServer.close();
    });
});
