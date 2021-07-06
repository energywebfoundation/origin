import { Button, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { SelectedItem } from '../SelectedItem';
import { useStyles } from './CertificateActionContent.styles';

export interface CertificateActionContentProps {
  title: string;
  buttonText: string;
}

export const CertificateActionContent: FC<CertificateActionContentProps> = ({
  title,
  buttonText,
  children,
}) => {
  const classes = useStyles();
  const hasCertificates = false;
  const amountSelected = hasCertificates ? 1 : 0;

  return (
    <Paper className={classes.paper}>
      <Typography gutterBottom variant="h6">
        {title}
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
      {children}
      <Button fullWidth disabled color="primary" variant="contained">
        {`${buttonText} ${amountSelected} Certificate(s)`}
      </Button>
    </Paper>
  );
};
