import React from 'react';
import { GenericForm, GenericModal } from '@energyweb/origin-ui-core';
import { Box, Switch, Typography } from '@material-ui/core';
import { useUpdateDemandEffects } from './UpdateDemand.effects';
import { useStyles } from './UpdateDemand.styles';

export const UpdateDemand = () => {
  const {
    open,
    closeDemandModal,
    formProps,
    demandStatus,
    updateStatus,
    totalVolume,
  } = useUpdateDemandEffects();
  const classes = useStyles();

  return (
    <GenericModal
      open={open}
      title="Update Demand"
      closeButton
      dialogProps={{ maxWidth: 'sm' }}
      handleClose={closeDemandModal}
      customContent={
        <Box>
          <Box>
            <Typography align="center">{'Total Volume'}</Typography>
            <Typography align="center" variant="h5">
              {totalVolume ? `${totalVolume} MWh` : '-'}
            </Typography>
          </Box>
          <Box
            p={2}
            className={classes.lightBgRounded}
            width="90%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>{'Activate Demand'}</Typography>
            <Switch
              color="primary"
              checked={demandStatus}
              onChange={updateStatus}
            />
          </Box>
          <Box width="95%" mx={'auto'}>
            <GenericForm {...formProps} />
          </Box>
        </Box>
      }
    />
  );
};
