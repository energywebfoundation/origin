import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useImportListItemHeaderEffects } from './ImportListItemHeader.effects';
import { useStyles } from './ImportListItemHeader.styles';

export interface ImportListItemHeaderProps {
  fuelType: string;
  deviceName: string;
  allFuelTypes: CodeNameDTO[];
  importHandler?: () => void;
}

export const ImportListItemHeader: FC<ImportListItemHeaderProps> = ({
  fuelType,
  allFuelTypes,
  deviceName,
  importHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const Icon = useImportListItemHeaderEffects(allFuelTypes, fuelType);

  return (
    <div className={classes.wrapper}>
      <div className={classes.iconAndName}>
        {Icon && <Icon className={classes.icon} />}
        <div>
          <Typography>{t('certificate.import.device')}</Typography>
          <Typography>{deviceName}</Typography>
        </div>
      </div>
      {importHandler && (
        <Button color="primary" variant="contained" onClick={importHandler}>
          {t('certificate.import.importButton')}
        </Button>
      )}
    </div>
  );
};
