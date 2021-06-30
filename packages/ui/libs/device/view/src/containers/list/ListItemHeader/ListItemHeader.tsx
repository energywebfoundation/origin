import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useListItemHeaderEffects } from './ListItemHeader.effects';
import { useStyles } from './ListItemHeader.styles';

export interface ListItemHeaderProps {
  fuelType: string;
  deviceName: string;
  allFuelTypes: CodeNameDTO[];
  importHandler?: () => void;
}

export const ListItemHeader: FC<ListItemHeaderProps> = ({
  fuelType,
  allFuelTypes,
  deviceName,
  importHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const Icon = useListItemHeaderEffects(allFuelTypes, fuelType);

  return (
    <div className={classes.wrapper}>
      <div className={classes.iconAndName}>
        {Icon && <Icon className={classes.icon} />}
        <div>
          <Typography>{t('device.import.device')}:</Typography>
          <Typography>{deviceName}</Typography>
        </div>
      </div>
      {importHandler && (
        <Button color="primary" variant="outlined" onClick={importHandler}>
          {t('device.import.importButton')}
        </Button>
      )}
    </div>
  );
};
