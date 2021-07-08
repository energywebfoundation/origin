import { Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './ListItemContent.styles';

export interface ListItemContentProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  generationTimeTitle: string;
  generationTimeText: string;
  viewButtonLabel: string;
}

export const ListItemContent: FC<ListItemContentProps> = ({
  icon: Icon,
  fuelType,
  energy,
  generationTimeTitle,
  generationTimeText,
  viewButtonLabel,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.infoBlock}>
        <Icon className={classes.icon} />
        <div>
          <div>
            <Typography color="textSecondary">{fuelType}</Typography>
            <Typography gutterBottom>{energy}</Typography>
          </div>
          <div>
            <Typography color="textSecondary">{generationTimeTitle}</Typography>
            <Typography>{generationTimeText}</Typography>
          </div>
        </div>
      </div>
      <Button className={classes.button} variant="outlined" color="primary">
        {viewButtonLabel}
      </Button>
    </div>
  );
};
