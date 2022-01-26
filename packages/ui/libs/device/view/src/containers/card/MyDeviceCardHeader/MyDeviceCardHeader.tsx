import React from 'react';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  SpecField,
  SpecFieldProps,
  TextWithPendingDot,
} from '@energyweb/origin-ui-core';
import { Button } from '@mui/material';
import { ChevronRight, Edit } from '@mui/icons-material';
import { useMyDeviceCardHeaderEffects } from './MyDeviceCardHeader.effects';
import { useStyles } from './MyDeviceCardHeader.styles';

export interface MyDeviceCardHeaderProps {
  deviceName: string;
  deviceState: DeviceState;
  viewButtonText: string;
  viewButtonLink: string;
  editButtonText: string;
  editButtonLink: string;
  specFieldProps: SpecFieldProps;
}

export const MyDeviceCardHeader: React.FC<MyDeviceCardHeaderProps> = ({
  deviceName,
  deviceState,
  viewButtonText,
  viewButtonLink,
  editButtonText,
  editButtonLink,
  specFieldProps,
}) => {
  const { viewDetailsClickHandler, editDeviceClickHandler, t } =
    useMyDeviceCardHeaderEffects(viewButtonLink, editButtonLink);
  const showEditButton = deviceState !== DeviceState.Approved;
  const classes = useStyles();

  return (
    <div className={classes.headerWrapper}>
      <div className={classes.nameBlockWrapper}>
        <TextWithPendingDot
          textContent={deviceName}
          typographyProps={{
            variant: 'h5',
            component: 'span',
            marginRight: '5px',
          }}
          pending={deviceState !== DeviceState.Approved}
          showSuccessDot={deviceState === DeviceState.Approved}
          tooltipText={t('device.my.deviceStatusTooltip', {
            status: deviceState,
          })}
          dotWrapperProps={{ ['data-cy']: 'deviceStatus' }}
        />
        <Button
          color="inherit"
          data-cy="viewDevice"
          onClick={viewDetailsClickHandler}
          className={classes.button}
          classes={{ endIcon: classes.buttonEndIcon }}
          endIcon={<ChevronRight />}
        >
          {viewButtonText}
        </Button>
        {showEditButton && (
          <Button
            color="inherit"
            data-cy="editDevice"
            onClick={editDeviceClickHandler}
            className={classes.button}
            classes={{ iconSizeMedium: classes.smallEndIcon }}
            endIcon={<Edit />}
            sx={{ marginLeft: '10px' }}
          >
            {editButtonText}
          </Button>
        )}
      </div>
      <div className={classes.specBlockWrapper}>
        <SpecField
          wrapperProps={{ className: classes.specFieldWrapper }}
          valueProps={{ className: classes.specFieldValue }}
          {...specFieldProps}
        />
      </div>
    </div>
  );
};
