import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { moment, formatDate } from '../../utils/time';
import { Button, ButtonGroup, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { ProducingDevice } from '@energyweb/device-registry';
import { reverse } from '../../utils/helper';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { useOriginConfiguration } from '../../utils/configuration';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';

enum TIMEFRAME {
    DAY = 'Day',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year'
}

const DEFAULT_TIMEFRAME = TIMEFRAME.MONTH;

interface ISmartMeterReadingsChartProps {
    producingDevice: ProducingDevice.Entity;
}

export function SmartMeterReadingsChart(props: ISmartMeterReadingsChartProps) {
    const { producingDevice } = props;
    const originConfiguration = useOriginConfiguration();

    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;

    const useStyles = makeStyles(() =>
        createStyles({
            selected: {
                backgroundColor: originBgColor
            }
        })
    );

    const classes = useStyles(useTheme());

    const { t } = useTranslation();

    const [selectedTimeFrame, setSelectedTimeFrame] = useState({
        timeframe: DEFAULT_TIMEFRAME,
        endDate: moment().toDate()
    });
    const [readings, setReadings] = useState([]);

    useEffect(() => {
        (async () => {
            setReadings(await producingDevice.getAmountOfEnergyGenerated());
        })();
    }, [producingDevice]);

    const graphOptions = {
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
    };

    const endDateInTimezone = moment(selectedTimeFrame?.endDate)
        .tz(producingDevice?.timezone)
        .clone();

    function changeSelectedTimeFrame(increment = true) {
        const { timeframe } = selectedTimeFrame;

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

        const currentDate = endDateInTimezone;

        const newEndDate = increment
            ? currentDate.add(1, measurementUnit)
            : currentDate.subtract(1, measurementUnit);

        setSelectedTimeFrame({
            timeframe,
            endDate: newEndDate.toDate()
        });
    }

    function getFormattedReadings() {
        const formatted = [];

        let measurementUnit;
        let amount;
        let keyFormat;
        let chartEndDate;

        switch (selectedTimeFrame.timeframe) {
            case TIMEFRAME.DAY:
                measurementUnit = 'hour';
                amount = 24;
                keyFormat = 'HH';
                chartEndDate = endDateInTimezone.endOf('day');
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'ddd D MMM';
                chartEndDate = endDateInTimezone.endOf('week');
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'day';
                amount = endDateInTimezone.daysInMonth();
                keyFormat = 'D MMM';
                chartEndDate = endDateInTimezone.endOf('month');
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'month';
                amount = 12;
                keyFormat = 'MMM';
                chartEndDate = endDateInTimezone.endOf('year');
        }

        let currentIndex = 0;

        while (currentIndex < amount) {
            const currentDate = chartEndDate
                .clone()
                .subtract(currentIndex, measurementUnit)
                .tz(producingDevice.timezone);

            let totalEnergy = BigNumber.from(0);

            for (const reading of readings) {
                const readingDate = moment.unix(reading.timestamp).tz(producingDevice.timezone);

                if (readingDate.isSame(currentDate, measurementUnit)) {
                    totalEnergy = totalEnergy.add(reading.energy);
                }
            }

            formatted.push({
                label:
                    measurementUnit !== 'hour'
                        ? currentDate.format(keyFormat)
                        : `${currentDate.format(keyFormat)}:00`,
                color: originConfiguration?.styleConfig?.PRIMARY_COLOR,
                value: EnergyFormatter.getValueInDisplayUnit(totalEnergy)
            });

            currentIndex += 1;
        }

        return reverse(formatted);
    }

    function getCurrentRangeInfo(): string {
        const { timeframe } = selectedTimeFrame;

        if (timeframe === TIMEFRAME.WEEK) {
            return `${formatDate(endDateInTimezone.startOf('week'))} - ${formatDate(
                endDateInTimezone.endOf('week')
            )}`;
        } else if (timeframe === TIMEFRAME.MONTH) {
            return endDateInTimezone.format('MMM YYYY');
        } else if (timeframe === TIMEFRAME.YEAR) {
            return endDateInTimezone.format('YYYY');
        }

        return formatDate(endDateInTimezone);
    }

    const currentRangeInfo = getCurrentRangeInfo();

    const formattedReadings = getFormattedReadings();

    const data = {
        labels: formattedReadings.map((entry) => entry.label),
        datasets: [
            {
                label: t('meterReads.properties.energy', { unit: EnergyFormatter.displayUnit }),
                backgroundColor: formattedReadings.map((entry) => entry.color),
                data: formattedReadings.map((entry) => entry.value)
            }
        ]
    };

    const timeFrameButtons = Object.keys(TIMEFRAME).map((timeframe, index) => {
        const onClick = () =>
            setSelectedTimeFrame({
                timeframe: TIMEFRAME[timeframe],
                endDate: moment().toDate()
            });

        const isCurrentlySelected = selectedTimeFrame.timeframe === TIMEFRAME[timeframe];

        return (
            <Button
                key={index}
                onClick={onClick}
                color="primary"
                className={`btn-switcher-btn ${isCurrentlySelected ? classes.selected : ''}`}
            >
                {t(`meterReads.properties.timeframes.${timeframe?.toLowerCase()}`)}
            </Button>
        );
    });

    (graphOptions as any).title = {
        display: true,
        text: currentRangeInfo
    };

    return (
        <div className="smartMeterReadingsChart text-center">
            <div className="row mb-4 vertical-align">
                <div className="col-lg-2">
                    <div
                        className="pull-left arrow-button"
                        onClick={() => changeSelectedTimeFrame(false)}
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
                        onClick={() => changeSelectedTimeFrame(true)}
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
