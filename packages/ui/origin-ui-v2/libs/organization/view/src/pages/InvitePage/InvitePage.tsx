import { GenericForm } from '@energyweb/origin-ui-core';
import { inviteForm } from '@energyweb/origin-ui-organization-logic';
import { Paper } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './InvitePage.styles';

export const InvitePage: FC = () => {
  const {
    fields,
    initialValues,
    validationSchema,
    submitHandler,
    buttonText,
  } = inviteForm;
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <GenericForm
        fields={fields}
        initialValues={initialValues}
        validationSchema={validationSchema}
        submitHandler={submitHandler}
        buttonText={buttonText}
        inputsVariant="filled"
        twoColumns={true}
        buttonWrapperProps={{
          mt: 1,
          mb: 0,
          justifyContent: 'flex-start',
        }}
      />
    </Paper>
  );
};
