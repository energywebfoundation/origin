import { SolarRegular } from '@energyweb/origin-ui-assets';
import { Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './ListItemContent.styles';

export const ListItemContent: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.infoBlock}>
        <SolarRegular className={classes.icon} />
        <div>
          <div>
            <Typography color="textSecondary">Solar</Typography>
            <Typography gutterBottom>1000 MWh</Typography>
          </div>
          <div>
            <Typography color="textSecondary">Generation Time Frame</Typography>
            <Typography>Dec 1, 2020 - Dec 31, 2020</Typography>
          </div>
        </div>
      </div>
      <Button className={classes.button} variant="outlined" color="primary">
        View
      </Button>
    </div>
  );
};
