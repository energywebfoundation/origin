import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './ImportListItemContent.styles';

export interface ImportListItemContentProps {
  volume: string;
  generationTimeFrame: string;
}

export const ImportListItemContent: FC<ImportListItemContentProps> = ({
  volume,
  generationTimeFrame,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.wrapper}>
      <div>
        <Typography>{t('certificate.import.volume')}:</Typography>
        <Typography>{volume}</Typography>
      </div>
      <div>
        <Typography>{t('certificate.import.generationTimeFrame')}:</Typography>
        <Typography>{generationTimeFrame}</Typography>
      </div>
    </div>
  );
};
