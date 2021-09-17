import {
  Bundle,
  BundlePublicDTO,
} from '@energyweb/exchange-react-query-client';
import {
  BundleSplit,
  useCachedAllDevices,
} from '@energyweb/origin-ui-exchange-data';
import { formatDate } from '@energyweb/origin-ui-utils';
import { Grid } from '@material-ui/core';
import React, { FC } from 'react';
import { BundleDevices } from '../BundleDevices';
import { SplitContents } from '../SplitContents';
import { useStyles } from './BundleContents.styles';

interface BundleContentsProps {
  bundle: Bundle | BundlePublicDTO;
  splits: BundleSplit[];
  isOwner: boolean;
}

export const BundleContents: FC<BundleContentsProps> = ({
  bundle,
  splits,
  isOwner,
}) => {
  const allDevices = useCachedAllDevices();
  const classes = useStyles();

  return (
    <Grid container>
      <Grid item xs={4} className={classes.devicesBlock}>
        {bundle.items.map((item) => {
          const device = allDevices.find(
            (device) => device.externalRegistryId === item.asset.deviceId
          );
          const generationTime = `${formatDate(
            item.asset.generationFrom
          )} - ${formatDate(item.asset.generationTo)}`;
          return (
            <BundleDevices
              key={device?.id}
              deviceName={device?.name}
              deviceLocation={device?.address}
              generationTime={generationTime}
            />
          );
        })}
      </Grid>
      <Grid item xs={8}>
        <SplitContents bundle={bundle} splits={splits} isOwner={isOwner} />
      </Grid>
    </Grid>
  );
};
