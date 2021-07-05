import { Button, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { SelectedItem } from '../SelectedItem';
import { useStyles } from './WithdrawAction.styles';

export const WithdrawAction: FC = () => {
  const classes = useStyles();
  const hasCertificates = false;

  return (
    <Paper className={classes.paper}>
      <Typography gutterBottom variant="h6">
        Selected for Withdrawal
      </Typography>
      {hasCertificates ? (
        <SelectedItem />
      ) : (
        <div className={classes.emptyTextWrapper}>
          <Typography color="textSecondary">Select Certificate</Typography>
        </div>
      )}
      <div className={classes.totalVolume}>
        <Typography color="textSecondary">Total volume</Typography>
        <Typography>0 MWh</Typography>
      </div>
      <Button fullWidth disabled color="primary" variant="contained">
        Withdraw 0 Certificate(s)
      </Button>
    </Paper>
  );
};
