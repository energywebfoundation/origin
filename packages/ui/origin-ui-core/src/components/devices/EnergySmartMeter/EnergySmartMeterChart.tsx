import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { Bar } from 'react-chartjs-2';
import { Button, ButtonGroup, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { MeterReadsClient, ReadDTO } from '@energyweb/origin-energy-api-client';
import { moment, formatDate } from '../../../utils/time';
import { reverse } from '../../../utils/helper';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { useOriginConfiguration } from '../../../utils/configuration';
import { getBackendClient, getEnvironment } from '../../../features/general';

enum TimeframeOptions {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year'
}

const DEFAULT_TIMEFRAME = TimeframeOptions.MONTH;

interface IProps {
    meterId: string;
}

export function EnergySmartMeterChart({ meterId }: IProps) {
    const originConfiguration = useOriginConfiguration();
    const environment = useSelector(getEnvironment);
    const marketUtcOffset = Number(environment?.MARKET_UTC_OFFSET) || 0;

    const backendClient = useSelector(getBackendClient);
    const meterReadsClient: MeterReadsClient = backendClient?.meterReadsClient;

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
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString()
    });
    const [readings, setReadings] = useState<ReadDTO[]>([]);

    useEffect(() => {
        (async () => {
            const { startDate, endDate } = selectedTimeFrame;
            const { data: defaultReadings } = await meterReadsClient.getReads(
                meterId,
                startDate,
                endDate
            );
            setReadings(defaultReadings);
        })();
    }, [meterId]);

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

    const formatTimeframe = (timeframe: TimeframeOptions) => {
        if (timeframe === TimeframeOptions.DAY) {
            return 'day';
        } else if (timeframe === TimeframeOptions.WEEK) {
            return 'week';
        } else if (timeframe === TimeframeOptions.MONTH) {
            return 'month';
        } else {
            return 'year';
        }
    };

    const endDateInTimezone = moment(selectedTimeFrame?.endDate).utcOffset(marketUtcOffset).clone();

    function changeSelectedTimeFrame(increment = true) {
        const { timeframe } = selectedTimeFrame;

        const measurementUnit = formatTimeframe(timeframe);

        const currentDate = endDateInTimezone;

        const newEndDate = increment
            ? currentDate.add(1, measurementUnit)
            : currentDate.subtract(1, measurementUnit);

        setSelectedTimeFrame({
            timeframe,
            startDate: newEndDate.startOf(measurementUnit).toISOString(),
            endDate: newEndDate.endOf(measurementUnit).toISOString()
        });
    }

    function getFormattedReadings() {
        const formatted = [];

        let measurementUnit: string;
        let amount: number;
        let keyFormat: string;
        let chartEndDate;

        switch (selectedTimeFrame.timeframe) {
            case TimeframeOptions.DAY:
                measurementUnit = 'hour';
                amount = 24;
                keyFormat = 'HH';
                chartEndDate = endDateInTimezone.endOf('day');
                break;

            case TimeframeOptions.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'ddd D MMM';
                chartEndDate = endDateInTimezone.endOf('week');
                break;

            case TimeframeOptions.MONTH:
                measurementUnit = 'day';
                amount = endDateInTimezone.daysInMonth();
                keyFormat = 'D MMM';
                chartEndDate = endDateInTimezone.endOf('month');
                break;

            case TimeframeOptions.YEAR:
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
                .utcOffset(marketUtcOffset);

            let totalEnergy = BigNumber.from(0);

            for (const reading of readings) {
                const readingDate = moment
                    .unix(Number(reading.timestamp))
                    .utcOffset(marketUtcOffset);

                if (readingDate.isSame(currentDate, TimeframeOptions[measurementUnit])) {
                    totalEnergy = totalEnergy.add(reading.value);
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

        if (timeframe === TimeframeOptions.WEEK) {
            return `${formatDate(endDateInTimezone.startOf('week'))} - ${formatDate(
                endDateInTimezone.endOf('week')
            )}`;
        } else if (timeframe === TimeframeOptions.MONTH) {
            return endDateInTimezone.format('MMM YYYY');
        } else if (timeframe === TimeframeOptions.YEAR) {
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

    const timeFrameButtons = Object.keys(TimeframeOptions).map((timeframe, index) => {
        const onClick = () => {
            const measurementUnit = formatTimeframe(TimeframeOptions[timeframe]);

            setSelectedTimeFrame({
                timeframe: TimeframeOptions[timeframe],
                startDate: moment().startOf(measurementUnit).toISOString(),
                endDate: moment().endOf(measurementUnit).toISOString()
            });
        };

        const isCurrentlySelected = selectedTimeFrame.timeframe === TimeframeOptions[timeframe];

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
