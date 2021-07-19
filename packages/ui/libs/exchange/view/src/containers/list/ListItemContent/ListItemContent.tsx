import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './ListItemContent.styles';

export interface ListItemContentProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  certificationDateTitle: string;
  certificationDateText: string;
}

export const ListItemContent: React.FC<ListItemContentProps> = ({
  icon: Icon,
  fuelType,
  energy,
  certificationDateTitle,
  certificationDateText,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.infoBlock}>
        <div className={classes.iconAndType}>
          <Icon className={classes.icon} />
          <div>
            <Typography color="textSecondary">{fuelType}</Typography>
            <Typography>{energy}</Typography>
          </div>
        </div>
        <div className={classes.dateBlock}>
          <Typography color="textSecondary">
            {certificationDateTitle}
          </Typography>
          <Typography>{certificationDateText}</Typography>
        </div>
      </div>
    </div>
  );
};
