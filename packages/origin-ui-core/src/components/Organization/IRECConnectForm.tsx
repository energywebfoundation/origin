import React from 'react';
import { Paper, Theme, useTheme, Grid, Box, Divider, makeStyles, Button } from '@material-ui/core';
import { useTranslation } from '../..';
import { Formik, Form, FormikHelpers } from 'formik';
import { useValidation } from '../../utils';
import { FormInput } from '../Form';
import variables from '../../styles/variables.scss';
import irecLogo from '../../../assets/logo-i-rec.svg';

const useStyles = makeStyles(() => ({
    divider: {
        backgroundColor: variables.backgroundColorLighter
    }
}));

const INITIAL_VALUES = {
    platformOrganizationId: '',
    irecUsername: '',
    apiToken: '',
    clientID: '',
    clientSecret: ''
};

export const IRECConnectForm = () => {
    const { spacing }: Theme = useTheme();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const classes = useStyles();

    const onConnect = (
        values: typeof INITIAL_VALUES,
        { setSubmitting }: FormikHelpers<typeof INITIAL_VALUES>
    ) => {
        setSubmitting(true);
        /**
         * Send mail to admin
         */
        setSubmitting(false);
        /**
         * Show successfully connected provided I-REC account message window
         */
    };

    const VALIDATION_SCHEME = Yup.object({
        platformOrganizationId: Yup.string()
            .required()
            .label(t('organization.registration.platformOrganizationId')),
        irecUsername: Yup.string().required().label(t('organization.registration.IRECUsername')),
        apiToken: Yup.string().required().label(t('organization.registration.apiToken')),
        clientID: Yup.string().required().label(t('organization.registration.clientId')),
        clientSecret: Yup.string().required().label(t('organization.registration.clientSecret'))
    });

    return (
        <Paper elevation={1} style={{ padding: spacing(2) }}>
            <Formik
                onSubmit={onConnect}
                initialValues={INITIAL_VALUES}
                validationSchema={VALIDATION_SCHEME}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting } = formikProps;
                    const buttonDisabled = isSubmitting || !isValid;
                    return (
                        <Form translate="no">
                            <Grid container direction="column">
                                <Grid item container>
                                    <Grid item container direction="column" xs={6}>
                                        <Grid item>
                                            <Box
                                                fontWeight="fontWeightBold"
                                                style={{ textTransform: 'capitalize' }}
                                            >
                                                {t('organization.registration.titleConnectIREC')}
                                            </Box>
                                        </Grid>
                                        <Grid item>
                                            <br />
                                            <Divider className={classes.divider} />
                                            <br />
                                        </Grid>
                                        <Grid item>
                                            <Box>
                                                {t(
                                                    'organization.registration.organizationInformation'
                                                )}
                                            </Box>
                                        </Grid>
                                        <Grid item style={{ paddingLeft: spacing(1) }}>
                                            <FormInput
                                                label={t(
                                                    'organization.registration.platformOrganizationId'
                                                )}
                                                property="platformOrganizationId"
                                                className="mt-3"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <br />
                                            <Divider className={classes.divider} />
                                            <br />
                                        </Grid>
                                        <Grid item>
                                            {t('organization.registration.IRECAPICredentials')}
                                        </Grid>

                                        <Grid container direction="column">
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.IRECUsername'
                                                    )}
                                                    property="irecUsername"
                                                    className="mt-3"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t('organization.registration.apiToken')}
                                                    property="apiToken"
                                                    className="mt-3"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t('organization.registration.clientID')}
                                                    property="clientID"
                                                    className="mt-3"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.clientSecret'
                                                    )}
                                                    property="clientSecret"
                                                    className="mt-3"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={6} style={{ position: 'relative' }}>
                                        <Box position="absolute" top="25%" left="25%">
                                            <img src={irecLogo} />
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid item container justify="flex-end">
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            disabled={buttonDisabled}
                                        >
                                            {t(
                                                'organization.registration.actions.connectOrganization'
                                            )}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
};
