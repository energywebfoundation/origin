import { Button, ButtonProps, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './TotalAndButtons.styles';

export type MarketButton = {
  label: string;
  onClick: () => void;
  buttonProps?: ButtonProps;
};

export interface TotalAndButtonsProps {
  totalPrice: string;
  buttons: MarketButton[];
}

export const TotalAndButtons: FC<TotalAndButtonsProps> = ({
  totalPrice,
  buttons,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div>
        <Typography variant="h6">TOTAL:</Typography>
        <Typography variant="h5">{'$ ' + totalPrice}</Typography>
      </div>
      <div>
        {buttons.map((button) => (
          <Button
            key={`market-button-${button.label}`}
            onClick={button.onClick}
            {...button.buttonProps}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
