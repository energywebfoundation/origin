import { Button, Paper, TextField, Typography } from '@material-ui/core';
import React, { FC, useState } from 'react';
import { SelectedItem } from '../SelectedItem';
import { useStyles } from './SellAction.styles';

export const SellAction: FC = () => {
  const classes = useStyles();
  const [price, setPrice] = useState('');
  const hasCertificates = true;

  return (
    <Paper className={classes.paper}>
      <Typography gutterBottom variant="h6">
        Selected for Sale
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
      <TextField
        fullWidth
        variant="standard"
        label="Price per MWh"
        margin="dense"
        onChange={(e) => setPrice(e.target.value)}
        value={price}
      />
      <div className={classes.totalPrice}>
        <Typography color="textSecondary">Total price</Typography>
        <Typography>$ 0.00</Typography>
      </div>
      <Button fullWidth disabled color="primary" variant="contained">
        Sell 0 Certificate(s)
      </Button>
    </Paper>
  );
};
