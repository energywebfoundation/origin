import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './ItemHighlightedContent.styles';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';

export interface ItemHighlightedContentProps extends ComposedPublicDevice {}

export const ItemHighlightedContent: FC<ItemHighlightedContentProps> = ({
  name,
  ownerId,
  id,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div>
      <Typography variant="h6" className={classes.text} gutterBottom>
        <b>{name}</b>
      </Typography>
      <Typography className={classes.text} paragraph>
        <b>
          {t('device.map.owner')} id: {ownerId}
        </b>
      </Typography>
      <a className={classes.link} href={`device/detail-view/${id}`}>
        {t('device.map.seeMore')}
      </a>
    </div>
  );
};
