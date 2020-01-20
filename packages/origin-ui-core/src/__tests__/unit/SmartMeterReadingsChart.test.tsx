import React from 'react';
import { shallow } from 'enzyme';
import { SmartMeterReadingsChart } from '../../components/SmartMeterReadingsChart';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { ProducingDevice, Device } from '@energyweb/device-registry';
import { Bar } from 'react-chartjs-2';
import moment from 'moment-timezone';
import { formatDate } from '../../utils/helper';

describe('SmartMeterReadingsChart', () => {
    it('correctly renders', async () => {
        const currentTime = moment().tz('Asia/Bangkok');
        const currentDay = currentTime.date();
        const currentMonthDates = new Array(currentTime.daysInMonth()).fill(null).map((x, i) =>
            currentTime
                .clone()
                .startOf('month')
                .add(i, 'days')
        );
        const currentDayHour = currentTime.hour();

        const offChainProperties: Partial<ProducingDevice.IOffChainProperties> = {
            timezone: 'Asia/Bangkok'
        };

        const reads: Device.ISmartMeterRead[] = [
            {
                energy: 1000,
                timestamp: currentTime.unix()
            }
        ];

        const producingDevice: Partial<ProducingDevice.Entity> = {
            offChainProperties: offChainProperties as ProducingDevice.IOffChainProperties,
            getSmartMeterReads: async () => reads
        };

        const rendered = await shallow(
            <SmartMeterReadingsChart producingDevice={producingDevice as ProducingDevice.Entity} />
        );

        expect(rendered.find('.btn-switcher-btn').map(a => a.text())).toStrictEqual([
            'Day',
            'Week',
            'Month',
            'Year'
        ]);

        expect(rendered.find('.btn-switcher-btn.selected').text()).toBe('Month');

        let barProps = rendered.find(Bar).props();

        expect(barProps.options.title.text).toBe(currentTime.format('MMM YYYY'));

        expect(barProps.data).toStrictEqual({
            labels: currentMonthDates.map(date => date.format('D MMM')),
            datasets: [
                {
                    backgroundColor: currentMonthDates.map(() => undefined),
                    data: currentMonthDates.map((item, index) =>
                        index === currentDay - 1 ? 0.001 : 0
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

        expect(rendered.find('.btn-switcher-btn.selected').text()).toBe('Day');

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
                    .map((item, index) => (index === currentDayHour ? 0.001 : 0)),
                label: `Energy (${EnergyFormatter.displayUnit})`
            }
        ]);
    });
});
