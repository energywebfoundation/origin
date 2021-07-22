import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './ListItemContent.styles';

export interface ListItemContentProps {
  capacity: string;
  country: string;
}

export const ListItemContent: FC<ListItemContentProps> = ({
  capacity,
  country,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.wrapper}>
      <div>
        <Typography>{t('device.import.capacity')}:</Typography>
        <Typography>{capacity}</Typography>
      </div>
      <div>
        <Typography>{t('device.import.country')}:</Typography>
        <Typography>{country}</Typography>
      </div>
    </div>
  );
};
