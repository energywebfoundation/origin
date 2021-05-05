import { GenericForm } from '@energyweb/origin-ui-core';
import { registerDeviceSubmitHandler } from '@energyweb/origin-ui-device-data';
import { Paper } from '@material-ui/core';
import React from 'react';
import { useRegisterPageEffects } from './RegisterPage.effects';
import { useStyles } from './RegisterPage.styles';

export const RegisterPage: React.FC = () => {
  const pageEffects = useRegisterPageEffects();
  const classes = useStyles();
  return (
    <>
      <Paper classes={{ root: classes.paper }}>
        <GenericForm
          twoColumns={true}
          submitHandler={registerDeviceSubmitHandler}
          {...pageEffects}
        />
      </Paper>
    </>
  );
};
