import { ReadingsWindowEnum } from '@energyweb/origin-ui-device-data';
import { CircularProgress, Typography } from '@material-ui/core';
import { ButtonsGroupWithArrows } from 'libs/ui/core/src/components/buttons';
import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { useSmartMeterChartsEffects } from './SmartMeterChart.effects';
import { smartMeterChartOptions } from './SmartMeterChart.options';
import { useStyles } from './SmartMeterChart.styles';

interface SmartMeterChartProps {
  meterId: string;
}

export const SmartMeterChart: FC<SmartMeterChartProps> = ({ meterId }) => {
  const classes = useStyles();
  const { windowButtons, displayDate, window, setWindow, isLoading } =
    useSmartMeterChartsEffects(meterId);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <div className={classes.buttonsWrapper}>
        <ButtonsGroupWithArrows
          selected={window}
          setSelected={setWindow}
          buttons={windowButtons}
          onLeftArrowClick={() => console.log('left click')}
          onRightArrowClick={() => console.log('right click')}
        />
      </div>
      {displayDate && (
        <div className={classes.dateWrapper}>
          <Typography>{displayDate}</Typography>
        </div>
      )}
      <div className={classes.chartWrapper}>
        <Bar type="bar" data={[]} options={smartMeterChartOptions} />
      </div>
    </>
  );
};
