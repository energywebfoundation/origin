import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';

import { Paper, Grid, Button, useTheme, makeStyles, createStyles } from '@material-ui/core';
import { OrganizationRole, Role } from '@energyweb/origin-backend-core';

import { showNotification, NotificationType } from '../../utils/notifications';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { getOffChainDataSource } from '../../features/general/selectors';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from '../MultiSelectAutocomplete';
import { roleNames } from './Organization';
import { useTranslation } from '../../utils';

interface IFormValues {
    email: string;
    role: OrganizationRole;
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

    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;

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
            await organizationClient.invite(values.email, Number(values.role));

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
                {(formikProps) => {
                    const { isValid, isSubmitting, values, setFieldValue } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    const supportedRoles: IAutocompleteMultiSelectOptionType[] = Object.keys(
                        roleNames
                    ).map((key) => ({ label: t(roleNames[key]), value: key.toString() }));

                    let selectedRole: IAutocompleteMultiSelectOptionType[];
                    if (values.role) {
                        const defaultRole = supportedRoles.find(
                            (role) => role.value === values.role.toString()
                        );
                        selectedRole = [defaultRole];
                    } else {
                        selectedRole = [];
                    }

                    return (
                        <Form translate="">
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
                                    <MultiSelectAutocomplete
                                        label="Role"
                                        placeholder=""
                                        options={supportedRoles.map((role) => ({
                                            label: role.label,
                                            value: role.value.toString()
                                        }))}
                                        onChange={(
                                            selection: IAutocompleteMultiSelectOptionType[]
                                        ) => {
                                            const [selected1, selected2] = selection;
                                            const selectedElement = selectedRole.length
                                                ? selected2
                                                : selected1;
                                            return setFieldValue('role', selectedElement?.value);
                                        }}
                                        selectedValues={selectedRole}
                                        className="mt-3"
                                        disabled={fieldDisabled}
                                        required={true}
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
