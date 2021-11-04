import { Tooltip } from '@mui/material';
import React, { FC, ReactElement } from 'react';
import { useStyles } from './SliderLabel.styles';

interface SliderLabelProps {
  open: boolean;
  value: string;
  children: ReactElement<any, any>;
}

export const SliderLabel: FC<SliderLabelProps> = ({
  children,
  open,
  value,
}) => {
  const styles = useStyles();
  return (
    <Tooltip
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={value}
      classes={{ tooltip: styles.tooltip }}
    >
      {children}
    </Tooltip>
  );
};
