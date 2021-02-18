import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
    Paper,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    FormControl,
    InputLabel,
    Select,
    FilledInput,
    MenuItem
} from '@material-ui/core';
import { Role } from '@energyweb/origin-backend-core';
import { setLoading, getBackendClient } from '../../../features/general';
import { getUserOffchain } from '../../../features/users';
import { showNotification, NotificationType } from '../../../utils/notifications';
import { roleNames } from '../../../utils/organizationRoles';
import { FormInput } from '../../Form';

interface IFormValues {
    email: string;
    role: number;
}

const INITIAL_FORM_VALUES: IFormValues = {
    email: '',
    role: Role.OrganizationUser
};

const VALIDATION_SCHEMA = Yup.object({
    email: Yup.string().email().required().label('Email')
});

export function OrganizationInvite() {
    const { t } = useTranslation();

    const invitationClient = useSelector(getBackendClient)?.invitationClient;
    const userOffchain = useSelector(getUserOffchain);

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
        values: IFormValues,
        formikActions: FormikHelpers<IFormValues>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await invitationClient.invite({
                email: values.email,
                role: values.role
            });

            showNotification(`Invitation sent`, NotificationType.Success);
        } catch (error) {
            console.warn('Error while inviting user to organization', error);
            const _error = { ...error };
            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else if (_error.response.status === 412) {
                showNotification(
                    `Only active users can perform this action. Your status is ${userOffchain.status}`,
                    NotificationType.Error
                );
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
                validateOnMount={true}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values, setFieldValue } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    const selectedRole: Role = values.role;
                    return (
                        <Form translate="no">
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
                                <Grid item xs={6}>
                                    <FormControl fullWidth={true} variant="filled" className="mt-3">
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={selectedRole}
                                            onChange={(e) =>
                                                setFieldValue('role', e.target.value as number)
                                            }
                                            fullWidth
                                            variant="filled"
                                            input={<FilledInput />}
                                        >
                                            {roleNames.map((role) => (
                                                <MenuItem key={role.label} value={role.value}>
                                                    {t(role.label)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
