import React from 'react';
import { mount } from 'enzyme';
import { Route } from 'react-router-dom';
import moment from 'moment';
import { TimeFrame } from '@energyweb/utils-general';

import { AppContainer } from '../../components/AppContainer';
import {
    WrapperComponent,
    setupStore,
    wait,
    createRenderedHelpers,
    waitForConditionAndAssert
} from '../utils/helpers';
import { startGanache, deployDemo, ACCOUNTS } from '../utils/demo';
import { dataTestSelector, formatDate } from '../../utils/helper';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { PowerFormatter } from '../../utils/PowerFormatter';

jest.setTimeout(100000);

describe.skip('Application[E2E]', () => {
    it('correctly navigates to producing device details', async () => {
        const ganacheServer = await startGanache();
        const {
            conf: { offChainDataSource }
        } = await deployDemo();

        const { store, history } = setupStore([`/devices/production?rpc=ws://localhost:8545`], {
            mockUserFetcher: false,
            logActions: false,
            offChainDataSource
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
                'Trader_Forename Trader_Surname'
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

            fillInputField('demandNeedsInDisplayUnit', '1');

            fillInputField('maxPricePerMWh', '1');

            await fillSelect('currency', 'USD', ['USD']);

            await fillSelect('timeframe', TimeFrame.daily.toString(), [
                'Day',
                'Week',
                'Month',
                'Year'
            ]);

            await fillDate('startDate', 1);
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
                    `${formatDate(moment().date(1))} - ${formatDate(moment().date(10))}`,
                    'any',
                    'any',
                    'daily',
                    'no',
                    'any',
                    '1',
                    '1.00 USD',
                    'Active',
                    expect.stringMatching(/9|10/gm),
                    'EditCloneDeleteShow supplies'
                ])
            );
        }

        async function testProducingDevices() {
            assertMainTableContent([
                'Device Manager organization',
                'Wuthering Heights Windfarm',
                'Central, Nakhon Pathom',
                'Wind - Onshore',
                '0',
                '0'
            ]);

            assertPagination(1, 1, 1);

            // Go to device details
            rendered
                .find('table tbody tr td')
                .first()
                .simulate('click');

            rendered.update();

            await wait(1000);

            expect(rendered.find('table tbody tr td div').map(el => el.text())).toEqual([
                'Facility name',
                'Wuthering Heights Windfarm ',
                'Device owner',
                'Device Manager organization ',
                'Certified by registry',
                'I-REC ',
                'Other green attributes',
                ' ',
                'Device type',
                'Wind - Onshore ',
                '',
                'Meter read',
                EnergyFormatter.format(0, true),
                'Public support',
                ' ',
                'Commissioning date',
                'Jan 1st, 1970 ',
                'Nameplate capacity',
                PowerFormatter.format(0, true),
                'Geo location',
                ',  ',
                '',
                ''
            ]);
        }

        await wait(10000);

        rendered.update();

        await testProducingDevices();
        await importTraderAccount();
        await testDemands();

        rendered.unmount();

        await ganacheServer.close();
    });
});
