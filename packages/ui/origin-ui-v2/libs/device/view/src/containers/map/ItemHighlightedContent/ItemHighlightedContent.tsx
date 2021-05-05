import { Typography } from '@material-ui/core';
import { IOriginDevice } from '@energyweb/origin-ui-device-logic';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './ItemHighlightedContent.styles';

export interface ItemHighlightedContentProps extends IOriginDevice {}

export const ItemHighlightedContent: FC<ItemHighlightedContentProps> = ({
  facilityName,
  organizationName,
  id,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div>
      <Typography variant="h6" className={classes.text} gutterBottom>
        <b>{facilityName}</b>
      </Typography>
      <Typography className={classes.text} paragraph>
        <b>
          {t('device.map.owner')}: {organizationName}
        </b>
      </Typography>
      <a className={classes.link} href={`device/detail-view/${id}`}>
        {t('device.map.seeMore')}
      </a>
    </div>
  );
};
