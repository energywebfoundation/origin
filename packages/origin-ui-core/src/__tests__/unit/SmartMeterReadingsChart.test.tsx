import React from 'react';
import { mount } from 'enzyme';
import { BigNumber } from 'ethers';
import { SmartMeterReadingsChart } from '../../components/devices/SmartMeterReadings/SmartMeterReadingsChart';
import { ProducingDevice } from '@energyweb/device-registry';
import { Bar } from 'react-chartjs-2';
import { formatDate, EnergyFormatter, moment } from '../../utils';
import { IDevice, IEnergyGenerated } from '@energyweb/origin-backend-core';
import { createRenderedHelpers } from '../utils/helpers';

describe('SmartMeterReadingsChart', () => {
    it('correctly renders', async () => {
        const currentTime = moment().tz('Asia/Bangkok');
        const currentDay = currentTime.date();
        const currentMonthDates = new Array(currentTime.daysInMonth())
            .fill(null)
            .map((x, i) => currentTime.clone().startOf('month').add(i, 'days'));
        const currentDayHour = currentTime.hour();

        const offChainProperties: Partial<IDevice> = {
            timezone: 'Asia/Bangkok'
        };

        const reads: IEnergyGenerated[] = [
            {
                energy: BigNumber.from(1000),
                timestamp: currentTime.unix()
            }
        ];

        const producingDevice: Partial<ProducingDevice.Entity> = {
            ...offChainProperties,
            getAmountOfEnergyGenerated: async () => reads
        };

        const rendered = await mount(
            <SmartMeterReadingsChart producingDevice={producingDevice as ProducingDevice.Entity} />
        );

        const { refresh } = createRenderedHelpers(rendered);

        expect(
            rendered
                .find('.btn-switcher-btn')
                .hostNodes()
                .map((a) => a.text())
        ).toStrictEqual(['Day', 'Week', 'Month', 'Year']);

        expect(rendered.find('.btn-switcher-btn.selected').hostNodes().text()).toBe('Month');

        await refresh();

        let barProps = rendered.find(Bar).props();

        expect(barProps.options.title.text).toBe(currentTime.format('MMM YYYY'));

        expect(barProps.data).toStrictEqual({
            labels: currentMonthDates.map((date) => date.format('D MMM')),
            datasets: [
                {
                    backgroundColor: currentMonthDates.map(() => undefined),
                    data: currentMonthDates.map((item, index) =>
                        index === currentDay - 1 ? 0.1 : 0
                    ),
                    label: `Energy (${EnergyFormatter.displayUnit})`
                }
            ]
        });

        const dayButton = rendered.find('.btn-switcher-btn').first();
        expect(dayButton.text()).toBe('Day');

        dayButton.simulate('click', {
            button: 0
        });

        rendered.update();

        barProps = rendered.find(Bar).props();

        expect(barProps.options.title.text).toBe(formatDate(currentTime));

        expect(rendered.find('.btn-switcher-btn.selected').hostNodes().text()).toBe('Day');

        expect(barProps.data.labels).toStrictEqual([
            '00:00',
            '01:00',
            '02:00',
            '03:00',
            '04:00',
            '05:00',
            '06:00',
            '07:00',
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00'
        ]);

        expect(barProps.data.datasets).toStrictEqual([
            {
                backgroundColor: new Array(24).fill(0).map(() => undefined),
                data: new Array(24)
                    .fill(0)
                    .map((item, index) => (index === currentDayHour ? 0.1 : 0)),
                label: `Energy (MWh)`
            }
        ]);
    });
});
