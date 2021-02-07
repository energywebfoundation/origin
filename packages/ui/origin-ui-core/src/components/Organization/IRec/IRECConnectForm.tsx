import React from 'react';
import { Paper, Theme, useTheme, Grid, Box, Divider, makeStyles, Button } from '@material-ui/core';
import { useTranslation } from '../../..';
import { Formik, Form, FormikHelpers } from 'formik';
import { useValidation, LightenColor } from '../../../utils';
import { FormInput } from '../../Form';
import irecLogo from '../../../../assets/logo-i-rec.svg';
import { useOriginConfiguration } from '../../../utils/configuration';

const INITIAL_VALUES = {
    irecUsername: '',
    apiToken: '',
    clientID: '',
    clientSecret: ''
};

export const IRECConnectForm = () => {
    const { spacing }: Theme = useTheme();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const configuration = useOriginConfiguration();
    const dividerBgColor = LightenColor(configuration?.styleConfig?.MAIN_BACKGROUND_COLOR, 10);

    const useStyles = makeStyles(() => ({
        divider: {
            backgroundColor: dividerBgColor
        }
    }));

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
