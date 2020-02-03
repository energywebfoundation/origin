import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, FormikActions } from 'formik';
import * as Yup from 'yup';

import { Paper, Grid, Button, useTheme, makeStyles, createStyles } from '@material-ui/core';

import { showNotification, NotificationType } from '../../utils/notifications';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { getOffChainDataSource } from '../../features/general/selectors';

interface IFormValues {
    email: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    email: ''
};

const VALIDATION_SCHEMA = Yup.object({
    email: Yup.string()
        .email()
        .required()
        .label('Email')
});

export function OrganizationInvite() {
    const organizationClient = useSelector(getOffChainDataSource).organizationClient;

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await organizationClient.invite(values.email);

            showNotification(`Invitation sent`, NotificationType.Success);
        } catch (error) {
            console.warn('Error while inviting user to organization', error);

            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else {
                showNotification('Could not invite user to organization.', NotificationType.Error);
            }
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const initialFormValues = INITIAL_FORM_VALUES;

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {formikProps => {
                    const { isValid, isSubmitting } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        label="Email"
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Invite
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
