import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { smartMeterChartOptions } from './SmartMeterChart.options';

interface SmartMeterChartProps {
  meterId: string;
}

export const SmartMeterChart: FC<SmartMeterChartProps> = ({ meterId }) => {
  return <Bar type="bar" data={[]} options={smartMeterChartOptions} />;
};
