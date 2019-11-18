import React from 'react';
import { mount } from 'enzyme';
import { AppContainer } from '../components/AppContainer';
import { Route } from 'react-router-dom';
import {
    WrapperComponent,
    setupStore,
    wait,
    createRenderedHelpers,
    waitForConditionAndAssert
} from './utils/helpers';
import { startGanache, deployDemo, ACCOUNTS } from './utils/demo';
import { dataTestSelector } from '../utils/helper';
import { TimeFrame } from '@energyweb/utils-general';

import moment from 'moment';

jest.setTimeout(100000);

describe('Application[E2E]', () => {
    it('correctly navigates to producing asset details', async () => {
        const ganacheServer = await startGanache();
        const { configurationClient, offChainDataClient } = await deployDemo();

        const { store, history } = setupStore([`/assets/production?rpc=ws://localhost:8545`], {
            mockUserFetcher: false,
            logActions: false,
            configurationClient,
            offChainDataClient
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

        async function importTraderAccount() {
            click('header-link-account-settings');
            click('account-link-import');

            fillInputField('account-import-privateKey', ACCOUNTS.TRADER.privateKey);

            submitForm('account-import-form');

            await refresh();

            fillInputField('request-password-modal-password', 'a');

            submitForm('request-password-modal-form');

            await wait(2000);
            await refresh();

            expect(rendered.find('.ViewProfile div.MuiSelect-select').text()).toBe(
                'Trader organization'
            );
        }

        async function testDemands() {
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

            await fillSelect('timeframe', TimeFrame.daily.toString(), [
                'Day',
                'Week',
                'Month',
                'Year'
            ]);

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
                expect.stringMatching(/9 MWh|10 MWh/gm)
            );

            submitForm('demandForm');

            await waitForConditionAndAssert(
                () => store.getState().router.location.pathname === '/demands/view/',
                () => expect(store.getState().router.location.pathname).toContain('/demands/view/'),
                100,
                10000
            );

            await refresh();

            click('demands-link-list');

            expect(store.getState().router.location.pathname).toBe('/demands/list');

            await wait(3000);
            await refresh();

            expect(
                rendered.find('table tbody.MuiTableBody-root tr td').map(el => el.text())
            ).toEqual(
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
        }

        async function testProducingAssets() {
            assertMainTableContent([
                'Asset Manager organization',
                'Wuthering Heights Windfarm',
                'Nakhon Pathom, Central',
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
                'Asset Manager organization ',
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
        }

        await wait(10000);

        rendered.update();

        await testProducingAssets();
        await importTraderAccount();
        await testDemands();

        rendered.unmount();

        await ganacheServer.close();
    });
});
