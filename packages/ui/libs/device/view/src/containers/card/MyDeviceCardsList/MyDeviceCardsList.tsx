import React from 'react';
import { Grid } from '@material-ui/core';

import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ResponsiveSidebar } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';

import { RequestCertificateForm } from '../../form';
import { MyDeviceCard } from '../MyDeviceCard';

import { useMyDeviceCardsListEffects } from './MyDeviceCardsList.effects';
import { useStyles } from './MyDevicesCardsList.styles';
import { NoDevicesOwnedCard } from '../NoDevicesOwnedCard';

export interface MyDeviceCardsListProps {
  devices: ComposedDevice[];
  allDeviceTypes: CodeNameDTO[];
}

export const MyDeviceCardsList: React.FC<MyDeviceCardsListProps> = ({
  devices,
  allDeviceTypes,
}) => {
  const {
    selected,
    closeSidebar,
    handleSelect,
    selectedDevice,
  } = useMyDeviceCardsListEffects(devices);

  const classes = useStyles();
  const listContentClass = `${classes.content} ${
    !!selected && classes.contentShift
  }`;

  if (devices.length === 0) {
    return <NoDevicesOwnedCard />;
  }

  return (
    <Grid container className={classes.wrapper}>
      <div className={listContentClass}>
        {devices.map((device) => (
          <MyDeviceCard
            key={device.id}
            selected={selected === device.id}
            onClick={() => handleSelect(device.id)}
            allDeviceTypes={allDeviceTypes}
            device={device}
          />
        ))}
      </div>
      <ResponsiveSidebar
        open={!!selected}
        handleClose={closeSidebar}
        sidebarProps={{
          anchor: 'right',
          PaperProps: { className: classes.drawerPaper },
        }}
      >
        {selectedDevice && (
          <RequestCertificateForm
            closeForm={closeSidebar}
            device={selectedDevice}
          />
        )}
      </ResponsiveSidebar>
    </Grid>
  );
};
