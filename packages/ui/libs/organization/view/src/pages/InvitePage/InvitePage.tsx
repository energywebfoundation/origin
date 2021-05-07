import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useInviteFormLogic } from '@energyweb/origin-ui-organization-logic';
import { useStyles } from './InvitePage.styles';

export const InvitePage: FC = () => {
  const {
    fields,
    initialValues,
    validationSchema,
    buttonText,
  } = useInviteFormLogic();
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <GenericForm
        fields={fields}
        initialValues={initialValues}
        validationSchema={validationSchema}
        // should add from data package
        submitHandler={(values) => console.log(values)}
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
