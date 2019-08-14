import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import 'moment/min/locales.min';
import { ButtonGroup, Button } from 'react-bootstrap';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import './SmartMeterReadingsChart.scss';
import { STYLE_CONFIG } from '../styles/styleConfig';

enum TIMEFRAME {
    DAY = 'Day',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year'
}

interface ISelectedTimeFrame {
    timeframe: string;
    endDate: Date;
}

export interface ISmartMeterReadingsChartProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export interface ISmartMeterReadingsChartState {
    graphOptions: object;
    selectedTimeFrame: ISelectedTimeFrame;
    readings: ProducingAsset.ISmartMeterRead[];
}

export class SmartMeterReadingsChart extends React.Component<ISmartMeterReadingsChartProps, ISmartMeterReadingsChartState> {
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
                            const tooltipValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                            return parseInt(tooltipValue).toLocaleString();
                        }
                    }
                }
            },
            selectedTimeFrame: {
                timeframe: TIMEFRAME.MONTH,
                endDate: moment().toDate()
            },
            readings: []
        };

        this.setSelectedTimeFrame = this.setSelectedTimeFrame.bind(this);
        this.changeSelectedTimeFrame = this.changeSelectedTimeFrame.bind(this);
    }

    async componentDidMount() {
        const readings: ProducingAsset.ISmartMeterRead[] = await this.props.producingAsset.getSmartMeterReads();

        this.setState({ readings });
    }

    setSelectedTimeFrame(timeframe: ISelectedTimeFrame) {
        this.setState({ selectedTimeFrame: timeframe });
    }

    changeSelectedTimeFrame(increment: boolean = true) {
        const { selectedTimeFrame: {
            timeframe, endDate
        } } = this.state;

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

        const currentDate = moment(endDate);

        const newEndDate = increment
            ? currentDate.add(1, measurementUnit)
            : currentDate.subtract(1, measurementUnit);

        this.setSelectedTimeFrame({
            timeframe,
            endDate: newEndDate.toDate()
        });
    }

    get formattedReadings() {
        const { readings, selectedTimeFrame: {
            endDate, timeframe
        } } = this.state;
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
                chartEndDate = moment(endDate).endOf('day');
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'ddd D MMM';
                chartEndDate = moment(endDate).endOf('week');
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'day';
                amount = moment(endDate).daysInMonth();
                keyFormat = 'D MMM';
                chartEndDate = moment(endDate).endOf('month');
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'month';
                amount = 12;
                keyFormat = 'MMM';
                chartEndDate = moment(endDate).endOf('year');
        }

        let currentIndex = 0;

        while (currentIndex < amount) {
            const currentDate = chartEndDate.clone().subtract(currentIndex, measurementUnit);
            let totalEnergy = 0;

            for (const reading of readings) {
                const readingDate = moment.unix(reading.timestamp);

                if (readingDate.isSame(currentDate, measurementUnit)) {
                    totalEnergy += reading.energy;
                }
            }

            formatted.push({
                label: measurementUnit !== 'hour' ? currentDate.format(keyFormat) : `${currentDate.format(keyFormat)}:00`,
                color: STYLE_CONFIG.PRIMARY_COLOR,
                value: totalEnergy
            });

            currentIndex += 1;
        }

        return formatted.reverse();
    }

    get currentRangeInfo(): string {
        const { selectedTimeFrame: {
            timeframe, endDate
        } } = this.state;

        const endDateRef = moment(endDate);

        if (timeframe === TIMEFRAME.WEEK) {
            return `${endDateRef.startOf('week').format('D MMM YYYY')} - ${endDateRef.endOf('week').format('D MMM YYYY')}`;
        } else if (timeframe === TIMEFRAME.MONTH) {
            return endDateRef.format('MMM YYYY');
        } else if (timeframe === TIMEFRAME.YEAR) {
            return endDateRef.format('YYYY');
        }

        return endDateRef.format('D MMM YYYY');
    }

    render() {
        const { selectedTimeFrame, graphOptions } = this.state;

        const data = {
            labels: this.formattedReadings.map(entry => entry.label),
            datasets: [
                {
                    label: 'Energy (Wh)',
                    backgroundColor: this.formattedReadings.map(entry => entry.color),
                    data: this.formattedReadings.map(entry => entry.value)
                }
            ]
        };

        const timeFrameButtons = Object.keys(TIMEFRAME).map((timeframe, index) => {
            const onClick = () => this.setSelectedTimeFrame({
                timeframe: TIMEFRAME[timeframe],
                endDate: moment().toDate()
            });

            const isCurrentlySelected = selectedTimeFrame.timeframe === TIMEFRAME[timeframe];

            return (
                <Button
                    key={index}
                    onClick={onClick}
                    className={`btn-switcher-btn ${isCurrentlySelected ? 'selected' : ''}`}
                    variant="primary"
                >
                    {TIMEFRAME[timeframe]}
                </Button>
            );
        });

        graphOptions['title'] = {
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
                        <ButtonGroup className="btn-switcher">
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
