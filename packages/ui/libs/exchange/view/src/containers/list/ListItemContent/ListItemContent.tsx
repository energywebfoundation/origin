import { Typography } from '@material-ui/core';
import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyles } from './ListItemContent.styles';

export interface ListItemContentProps<Id> {
  certificateId: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  certificationDateTitle: string;
  certificationDateText: string;
}

export type TListItemContent = <Id>(
  props: PropsWithChildren<ListItemContentProps<Id>>
) => ReactElement;

export const ListItemContent: TListItemContent = ({
  certificateId,
  icon: Icon,
  fuelType,
  energy,
  certificationDateTitle,
  certificationDateText,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();

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
