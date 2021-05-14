import { GenericForm } from '@energyweb/origin-ui-core';
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
          submitHandler={(values) => console.log(values)}
          {...pageEffects}
        />
      </Paper>
    </>
  );
};
