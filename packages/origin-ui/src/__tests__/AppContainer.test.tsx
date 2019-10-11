import * as React from 'react';
import { mount } from 'enzyme';
import { AppContainer } from '../components/AppContainer';
import { Route } from 'react-router-dom';
import { WrapperComponent, setupStore, wait, createRenderedHelpers } from './utils/helpers';
import { startGanache, deployDemo, ACCOUNTS } from './utils/demo';
import { startAPI } from '@energyweb/utils-testbackend/dist/js/src/api';
import { dataTestSelector } from '../utils/Helper';
import { TimeFrame } from '@energyweb/utils-general';

import moment from 'moment';

jest.setTimeout(80000);

let ganacheServer;
let apiServer;

describe('Application[E2E]', () => {
    beforeAll(async () => {
        apiServer = await startAPI();
        ganacheServer = await startGanache();
        await deployDemo();
    });

    it('correctly navigates to producing asset details', async () => {
        const { store, history } = setupStore([`/assets/?rpc=ws://localhost:8545`], {
            mockUserFetcher: false,
            logActions: true
        });

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <Route path="/" component={AppContainer} />
            </WrapperComponent>
        );

        const {
            assertMainTableContent,
            assertPagination,
            fillDate,
            fillInputField,
            fillSelect,
            refresh,
            click,
            submitForm
        } = createRenderedHelpers(rendered);

        await wait(8000);

        rendered.update();

        assertMainTableContent([
            'Asset Manager organization',
            'Wuthering Heights Windfarm',
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140, Thailand',
            'Wind - Onshore',
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
            'Wind - Onshore ',
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

        // Go to Account -> Import and import trader account

        click('header-link-account-settings');
        click('account-link-import');

        fillInputField('account-import-privateKey', ACCOUNTS.TRADER.privateKey);
        fillInputField('account-import-password', 'a');

        submitForm('account-import-form');

        await wait(1000);
        await refresh();

        expect(rendered.find('.ViewProfile div.MuiSelect-select').text()).toBe(
            'Trader organization'
        );

        // Go to Demands -> Create and create a demand

        click('header-link-demands');
        click('demands-link-create');

        const submitButton = rendered.find(`button${dataTestSelector('submitButton')}`);

        expect(submitButton.text()).toBe('Create demand');
        expect(submitButton.getDOMNode().hasAttribute('disabled')).toBe(true);

        expect(
            rendered
                .find(`span${dataTestSelector('submitButtonTooltip')}`)
                .getDOMNode()
                .getAttribute('title')
        ).toBe('Form needs to be valid to proceed.');

        expect(rendered.find(dataTestSelector('totalDemand')).text()).toBe('0 MWh');

        fillInputField('demandNeedsInMWh', '1');

        fillInputField('maxPricePerMWh', '1');

        await fillSelect('currency', 'EUR', ['EUR', 'USD', 'SGD', 'THB']);

        await fillSelect('timeframe', TimeFrame.daily.toString(), ['Day', 'Week', 'Month', 'Year']);

        await fillDate('startDate', 1);
        await fillDate('activeUntilDate', 10);
        await fillDate('endDate', 10);

        expect(
            rendered
                .find(`span${dataTestSelector('submitButtonTooltip')}`)
                .getDOMNode()
                .getAttribute('title')
        ).toBe(null);

        expect(submitButton.getDOMNode().hasAttribute('disabled')).toBe(false);

        expect(rendered.find(dataTestSelector('totalDemand')).text()).toEqual(
            expect.stringMatching(/9 MWh|10 Mwh/gm)
        );

        submitForm('demandForm');

        await wait(4000);
        await refresh();

        expect(store.getState().router.location.pathname).toContain('/demands/view/');

        click('demands-link-list');

        expect(store.getState().router.location.pathname).toBe('/demands/list');

        await wait(2000);
        await refresh();

        expect(rendered.find('table tbody.MuiTableBody-root tr td').map(el => el.text())).toEqual(
            expect.arrayContaining([
                'Trader organization',
                `${moment()
                    .date(1)
                    .format('DD MMM YY')} - ${moment()
                    .date(10)
                    .format('DD MMM YY')}`,
                'any',
                'any',
                'daily',
                'no',
                'any',
                '1',
                '1.00 EUR',
                'Active',
                expect.stringMatching(/9|10/gm),
                'EditCloneDeleteShow supplies'
            ])
        );

        rendered.unmount();

        await ganacheServer.close();

        apiServer.close();
    });
});
