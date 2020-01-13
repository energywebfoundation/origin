import React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment-timezone';
import 'moment/min/locales.min';

import { ProducingDevice, Device } from '@energyweb/device-registry';

import './SmartMeterReadingsChart.scss';
import { STYLE_CONFIG } from '../styles/styleConfig';
import { Button, ButtonGroup } from '@material-ui/core';
import { reverse, formatDate } from '../utils/helper';
import { EnergyFormatter } from '../utils/EnergyFormatter';

enum TIMEFRAME {
    DAY = 'Day',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year'
}

const DEFAULT_TIMEFRAME = TIMEFRAME.MONTH;

interface ISelectedTimeFrame {
    timeframe: string;
    endDate: Date;
}

interface ISmartMeterReadingsChartProps {
    producingDevice: ProducingDevice.Entity;
}

interface ISmartMeterReadingsChartState {
    graphOptions: object;
    selectedTimeFrame: ISelectedTimeFrame;
    readings: Device.ISmartMeterRead[];
}

export class SmartMeterReadingsChart extends React.Component<
    ISmartMeterReadingsChartProps,
    ISmartMeterReadingsChartState
> {
    constructor(props: ISmartMeterReadingsChartProps) {
        super(props);

        moment.locale(window.navigator.language);

        this.state = {
            graphOptions: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => {
                            const tooltipValue =
                                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                            return parseInt(tooltipValue, 10).toLocaleString();
                        }
                    }
                }
            },
            selectedTimeFrame: {
                timeframe: DEFAULT_TIMEFRAME,
                endDate: moment().toDate()
            },
            readings: []
        };

        this.setSelectedTimeFrame = this.setSelectedTimeFrame.bind(this);
        this.changeSelectedTimeFrame = this.changeSelectedTimeFrame.bind(this);
    }

    async componentDidMount() {
        const readings: Device.ISmartMeterRead[] = await this.props.producingDevice.getSmartMeterReads();

        this.setState({ readings });
    }

    get endDateInTimezone() {
        return moment(this.state.selectedTimeFrame?.endDate)
            .tz(this.props.producingDevice?.offChainProperties?.timezone)
            .clone();
    }

    setSelectedTimeFrame(timeframe: ISelectedTimeFrame) {
        this.setState({ selectedTimeFrame: timeframe });
    }

    changeSelectedTimeFrame(increment = true) {
        const {
            selectedTimeFrame: { timeframe }
        } = this.state;

        let measurementUnit;

        if (timeframe === TIMEFRAME.DAY) {
            measurementUnit = 'day';
        } else if (timeframe === TIMEFRAME.WEEK) {
            measurementUnit = 'week';
        } else if (timeframe === TIMEFRAME.MONTH) {
            measurementUnit = 'month';
        } else {
            measurementUnit = 'year';
        }

        const currentDate = this.endDateInTimezone;

        const newEndDate = increment
            ? currentDate.add(1, measurementUnit)
            : currentDate.subtract(1, measurementUnit);

        this.setSelectedTimeFrame({
            timeframe,
            endDate: newEndDate.toDate()
        });
    }

    getFormattedReadings(
        readings: Device.ISmartMeterRead[],
        timeframe: string,
        producingDevice: ProducingDevice.Entity
    ) {
        const formatted = [];

        let measurementUnit;
        let amount;
        let keyFormat;
        let chartEndDate;

        switch (timeframe) {
            case TIMEFRAME.DAY:
                measurementUnit = 'hour';
                amount = 24;
                keyFormat = 'HH';
                chartEndDate = this.endDateInTimezone.endOf('day');
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'ddd D MMM';
                chartEndDate = this.endDateInTimezone.endOf('week');
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'day';
                amount = this.endDateInTimezone.daysInMonth();
                keyFormat = 'D MMM';
                chartEndDate = this.endDateInTimezone.endOf('month');
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'month';
                amount = 12;
                keyFormat = 'MMM';
                chartEndDate = this.endDateInTimezone.endOf('year');
        }

        let currentIndex = 0;

        while (currentIndex < amount) {
            const currentDate = chartEndDate
                .clone()
                .subtract(currentIndex, measurementUnit)
                .tz(producingDevice.offChainProperties.timezone);

            let totalEnergy = 0;

            for (const reading of readings) {
                const readingDate = moment
                    .unix(reading.timestamp)
                    .tz(producingDevice.offChainProperties.timezone);

                if (readingDate.isSame(currentDate, measurementUnit)) {
                    totalEnergy += reading.energy;
                }
            }

            formatted.push({
                label:
                    measurementUnit !== 'hour'
                        ? currentDate.format(keyFormat)
                        : `${currentDate.format(keyFormat)}:00`,
                color: STYLE_CONFIG.PRIMARY_COLOR,
                value: EnergyFormatter.getValueInDisplayUnit(totalEnergy)
            });

            currentIndex += 1;
        }

        return reverse(formatted);
    }

    get currentRangeInfo(): string {
        const {
            selectedTimeFrame: { timeframe }
        } = this.state;

        if (timeframe === TIMEFRAME.WEEK) {
            return `${formatDate(this.endDateInTimezone.startOf('week'))} - ${formatDate(
                this.endDateInTimezone.endOf('week')
            )}`;
        } else if (timeframe === TIMEFRAME.MONTH) {
            return this.endDateInTimezone.format('MMM YYYY');
        } else if (timeframe === TIMEFRAME.YEAR) {
            return this.endDateInTimezone.format('YYYY');
        }

        return formatDate(this.endDateInTimezone);
    }

    render() {
        const { selectedTimeFrame, graphOptions, readings } = this.state;
        const { producingDevice } = this.props;

        const formattedReadings = this.getFormattedReadings(
            readings,
            selectedTimeFrame.timeframe,
            producingDevice
        );

        const data = {
            labels: formattedReadings.map(entry => entry.label),
            datasets: [
                {
                    label: `Energy (${EnergyFormatter.displayUnit})`,
                    backgroundColor: formattedReadings.map(entry => entry.color),
                    data: formattedReadings.map(entry => entry.value)
                }
            ]
        };

        const timeFrameButtons = Object.keys(TIMEFRAME).map((timeframe, index) => {
            const onClick = () =>
                this.setSelectedTimeFrame({
                    timeframe: TIMEFRAME[timeframe],
                    endDate: moment().toDate()
                });

            const isCurrentlySelected = selectedTimeFrame.timeframe === TIMEFRAME[timeframe];

            return (
                <Button
                    key={index}
                    onClick={onClick}
                    color="primary"
                    className={`btn-switcher-btn ${isCurrentlySelected ? 'selected' : ''}`}
                >
                    {TIMEFRAME[timeframe]}
                </Button>
            );
        });

        (graphOptions as any).title = {
            display: true,
            text: this.currentRangeInfo
        };

        return (
            <div className="smartMeterReadingsChart text-center">
                <div className="row mb-4 vertical-align">
                    <div className="col-lg-2">
                        <div
                            className="pull-left arrow-button"
                            onClick={() => this.changeSelectedTimeFrame(false)}
                        >
                            {'<'}
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <ButtonGroup className="btn-switcher" variant="contained" color="primary">
                            {timeFrameButtons}
                        </ButtonGroup>
                    </div>

                    <div className="col-lg-2">
                        <div
                            className="pull-right arrow-button"
                            onClick={() => this.changeSelectedTimeFrame(true)}
                        >
                            {'>'}
                        </div>
                    </div>
                </div>

                <div className="graph">
                    <Bar data={data} options={graphOptions} redraw={true} />
                </div>
            </div>
        );
    }
}
