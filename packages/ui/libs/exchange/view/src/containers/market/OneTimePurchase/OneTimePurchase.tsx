import { Divider, TextField } from '@material-ui/core';
import React from 'react';
import { MarketButton, TotalAndButtons } from '../TotalAndButtons';
import { useStyles } from './OneTimePurchase.styles';

export const OneTimePurchase = () => {
  const classes = useStyles();

  const buttonsMock: MarketButton[] = [
    {
      label: 'Place bid order',
      onClick: () => {
        console.log('place bid clicked');
      },
      buttonProps: {
        variant: 'contained',
        disabled: true,
      },
    },
  ];

  return (
    <div className={classes.wrapper}>
      <div className={classes.blockWrapper}>
        <TextField
          label="Generation Date Start"
          variant="filled"
          className={classes.item}
        />
        <TextField
          label="Generation Date End"
          variant="filled"
          className={classes.item}
        />
      </div>
      <Divider className={classes.divider} />
      <div className={classes.blockWrapper}>
        <TextField label="Energy" variant="filled" className={classes.item} />
        <TextField label="Price" variant="filled" className={classes.item} />
      </div>
      <TotalAndButtons totalPrice="$0.00" buttons={buttonsMock} />
    </div>
  );
};
