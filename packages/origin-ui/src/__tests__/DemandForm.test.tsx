import * as React from 'react';
import { mount } from 'enzyme';
import { dataTestSelector } from '../utils/Helper';
import { DemandForm } from '../components/Demand/DemandForm';
import { TimeFrame, Currency, Unit } from '@energyweb/utils-general';
import { Demand } from '@energyweb/market';
import moment from 'moment';
import { setupStore, createRenderedHelpers, WrapperComponent } from './utils/helpers';

let createDemand: (offChainProps: Demand.IDemandOffChainProperties) => void = null;

jest.setTimeout(80000);

jest.mock('@energyweb/market', () => {
    return {
        Demand: {
            createDemand(offChainProps: any) {
                return createDemand(offChainProps);
            },
            calculateTotalEnergyDemand() {
                return 9 * Unit.MWh;
            }
        }
    };
});

describe('DemandForm', () => {
    afterAll(() => {
        jest.unmock('@energyweb/market');
    });

    it('creating demand works', async () => {
        const { store, setCurrentUser, history } = setupStore();

        setCurrentUser({
            id: '1'
        });

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <DemandForm />
            </WrapperComponent>
        );

        const { refresh, fillInputField, fillDate, fillSelect } = createRenderedHelpers(rendered);

        await refresh();

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

        createDemand = (offChainProps: Demand.IDemandOffChainProperties) => {
            const now = moment();

            expect(moment.unix(offChainProps.startTime).format('YYYY-MM-D')).toBe(
                now
                    .clone()
                    .set('date', 1)
                    .format('YYYY-MM-D')
            );
            expect(moment.unix(offChainProps.endTime).format('YYYY-MM-D')).toBe(
                now
                    .clone()
                    .set('date', 10)
                    .format('YYYY-MM-D')
            );

            delete offChainProps.startTime;
            delete offChainProps.endTime;

            expect(offChainProps).toStrictEqual({
                currency: Currency.EUR,
                timeFrame: TimeFrame.daily,
                maxPricePerMwh: 100,
                energyPerTimeFrame: 1000000
            });

            return {
                id: '3123'
            };
        };

        expect(rendered.find(dataTestSelector('totalDemand')).text()).toBe('9 MWh');

        rendered.find(`form${dataTestSelector('demandForm')}`).simulate('submit');

        await refresh();

        expect(store.getState().router.location.pathname).toBe(`/demands/view/3123`);
    });
});
