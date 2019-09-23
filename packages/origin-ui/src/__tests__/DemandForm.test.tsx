import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createMemoryHistory } from 'history';
import { createRootReducer } from '../reducers';
import { dataTestSelector } from '../utils/Helper';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import sagas from '../features/sagas';
import { DemandForm } from '../components/Demand/DemandForm';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { TimeFrame, Currency } from '@energyweb/utils-general';
import { addUser, updateCurrentUserId } from '../features/users/actions';
import { User } from '@energyweb/user-registry';
import { Demand } from '@energyweb/market';
import moment from 'moment';

const flushPromises = () => new Promise(setImmediate);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function waitForConditionAndAssert(
    conditionCheckFunction: () => Promise<boolean> | boolean,
    assertFunction: () => Promise<void> | void,
    interval: number,
    timeout: number
): Promise<void> {
    let timePassed = 0;

    while (timePassed < timeout) {
        if (await conditionCheckFunction()) {
            await assertFunction();

            return;
        }

        await sleep(interval);
        timePassed += interval;
    }

    await assertFunction();
}

let createDemand: (offChainProps: Demand.IDemandOffChainProperties) => void = null;

jest.mock('@energyweb/market', () => {
    return {
        Demand: {
            createDemand(offChainProps: any) {
                return createDemand(offChainProps);
            }
        }
    };
});

describe('DemandForm', () => {
    afterAll(() => {
        jest.unmock('@energyweb/market');
    });

    it.only('creating demand works', async () => {
        const history = createMemoryHistory();

        const sagaMiddleware = createSagaMiddleware();

        const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);

        const store = createStore(createRootReducer(history), middleware);

        Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
            sagaMiddleware.run(sagas[saga]);
        });

        store.dispatch(
            addUser(({
                id: '1',
                isRole: () => true
            } as Partial<User.Entity>) as User.Entity)
        );

        store.dispatch(updateCurrentUserId('1'));

        const rendered = mount(
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <DemandForm />
                    </ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        );

        const refresh = async () => {
            await flushPromises();
            rendered.update();
        };

        function fillInputField(name: string, value: string) {
            const input = rendered.find(`${dataTestSelector(name)} input`);
            const inputField = input.getDOMNode();

            expect(inputField.getAttribute('name')).toBe(name);

            input.simulate('change', { target: { value, name } });
        }

        const now = moment();

        async function fillDate(name: string, dayOfMonth: number) {
            rendered.find(`div${dataTestSelector(name)}`).simulate('click');

            expect(document.querySelector('.MuiPickersToolbar-toolbar').textContent).toBe(
                now.format('YYYYddd, MMM D')
            );

            const daysElements = document.querySelectorAll(
                '.MuiPickersDay-day:not(.MuiPickersDay-hidden)'
            );
            (daysElements.item(dayOfMonth - 1) as HTMLElement).click();

            await refresh();

            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe(
                now
                    .clone()
                    .set('date', dayOfMonth)
                    .format('MMMM Do')
            );

            // Close Datepicker (click outside)
            (document.querySelector('body > [role="presentation"] > div') as HTMLElement).click();

            await refresh();

            await waitForConditionAndAssert(
                () => document.querySelector('.MuiPickersToolbar-toolbar') === null,
                () => {
                    expect(document.querySelector('.MuiPickersToolbar-toolbar')).toBe(null);
                },
                10,
                100
            );
        }

        async function fillSelect(name: string, valueToSelect: string, labels: string[]) {
            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe('');

            rendered.find(`#select-${name}`).simulate('click');

            expect(
                Array.from(document.querySelectorAll(`#menu-${name} ul li`)).map(i => i.textContent)
            ).toStrictEqual(labels);

            (document.querySelector(
                `#menu-${name} [data-value="${valueToSelect}"]`
            ) as HTMLElement).click();

            await refresh();

            expect(document.querySelector(`#menu-${name} [data-value="${valueToSelect}"]`)).toBe(
                null
            );

            expect(
                (rendered.find(`${dataTestSelector(name)} input`).getDOMNode() as HTMLInputElement)
                    .value
            ).toBe(valueToSelect);
        }

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
            expect(moment.unix(parseInt(offChainProps.startTime, 10)).format('YYYY-MM-D')).toBe(
                now
                    .clone()
                    .set('date', 1)
                    .format('YYYY-MM-D')
            );
            expect(moment.unix(parseInt(offChainProps.endTime, 10)).format('YYYY-MM-D')).toBe(
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
                targetWhPerPeriod: 1000000
            });

            return {
                id: '3123'
            };
        };

        expect(rendered.find(dataTestSelector('totalDemand')).text()).toBe('9 MWh');

        rendered.find(`form${dataTestSelector('demandForm')}`).simulate('submit');

        await refresh();

        expect(store.getState().router.location.pathname).toBe(`//demands/view/3123`);
    });
});
