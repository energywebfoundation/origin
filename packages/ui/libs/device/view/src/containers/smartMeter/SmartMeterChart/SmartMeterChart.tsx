import { Typography } from '@mui/material';
import { ButtonsGroupWithArrows } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
} from 'chart.js';
import { useSmartMeterChartsEffects } from './SmartMeterChart.effects';
import { smartMeterChartOptions } from './SmartMeterChart.options';
import { useStyles } from './SmartMeterChart.styles';

ChartJS.register(LinearScale, CategoryScale, BarElement);

interface SmartMeterChartProps {
  meterId: string;
}

export const SmartMeterChart: FC<SmartMeterChartProps> = ({ meterId }) => {
  const classes = useStyles();
  const {
    windowButtons,
    displayDate,
    window,
    setWindow,
    decrementDate,
    incrementDate,
    chartData,
  } = useSmartMeterChartsEffects(meterId);

  return (
    <>
      <div className={classes.buttonsWrapper}>
        <ButtonsGroupWithArrows
          selected={window}
          setSelected={setWindow}
          buttons={windowButtons}
          onLeftArrowClick={decrementDate}
          onRightArrowClick={incrementDate}
        />
      </div>
      {displayDate && (
        <div className={classes.dateWrapper}>
          <Typography>{displayDate}</Typography>
        </div>
      )}
      <div className={classes.chartWrapper}>
        <Bar data={chartData} options={smartMeterChartOptions} />
      </div>
    </>
  );
};
