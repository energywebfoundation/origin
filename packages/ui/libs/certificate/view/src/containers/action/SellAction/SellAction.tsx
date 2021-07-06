import { TextField, Typography } from '@material-ui/core';
import React, { FC, useState } from 'react';
import { CertificateActionContent } from '../../list';
import { useStyles } from './SellAction.styles';

export const SellAction: FC = () => {
  const classes = useStyles();
  const [price, setPrice] = useState('');

  return (
    <CertificateActionContent title="Selected for Sale" buttonText="Sell">
      <>
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
      </>
    </CertificateActionContent>
  );
};
