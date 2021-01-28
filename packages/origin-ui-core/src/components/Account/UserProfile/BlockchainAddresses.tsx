import { NotificationType, showNotification, useValidation } from '../../../utils';
import { Form, Formik, FormikHelpers, FormikProps, yupToFormErrors } from 'formik';
import { getLoading, setLoading } from '../../../features/general';
import {
    createExchangeDepositAddress,
    getActiveBlockchainAccountAddress,
    getExchangeDepositAddress,
    getUserOffchain,
    refreshUserOffchain,
    updateUserBlockchain
} from '../../../features/users';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import { FormInput } from '../../Form';
import { IconPopover, IconSize } from '../../IconPopover';
import { Info } from '@material-ui/icons';
import { getBlockchainAccount, getExchangeAccount } from '../../../utils/user';

export function BlockchainAddresses(): JSX.Element {
    const { Yup } = useValidation();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const activeBlockchainAccountAddress = useSelector(getActiveBlockchainAccountAddress);
    const isLoading = useSelector(getLoading);
    const exchangeAddress = useSelector(getExchangeDepositAddress);
    const user = useSelector(getUserOffchain);
    let changeFieldValue: (name: string, value: any) => void;

    useEffect(() => {
        if (typeof changeFieldValue === 'function') {
            changeFieldValue('exchangeDepositAddress', exchangeAddress);
        }
    }, [exchangeAddress]);

    const VALIDATION_SCHEMA = Yup.object().shape({
        blockchainAccountAddress: Yup.string()
            .label(t('user.properties.blockchainAddress'))
            .required()
    });

    const INITIAL_VALUES = {
        blockchainAccountAddress: getBlockchainAccount(user)?.address || '',
        exchangeDepositAddress: getExchangeAccount(user)?.address || ''
    };

    async function submitForm(
        values: typeof INITIAL_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            // await userClient.updateOwnBlockchainAddress({});
            showNotification(t('user.profile.updateChainAddress'), NotificationType.Success);
            dispatch(refreshUserOffchain());
        } catch (error) {
            showNotification(t('user.profile.errorUpdateChainAddress'), NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    async function ValidationHandler(values: typeof INITIAL_VALUES) {
        try {
            await VALIDATION_SCHEMA.validate(values, {
                abortEarly: false
            });
            return {};
        } catch (err) {
            return yupToFormErrors(err);
        }
    }

    function createExchangeAddress(): void {
        dispatch(createExchangeDepositAddress());
    }

    function updateBlockchainAccount(callback: () => void): void {
        dispatch(
            updateUserBlockchain({
                user,
                activeAccount: activeBlockchainAccountAddress,
                callback
            })
        );
    }

    return (
        <Formik
            initialValues={INITIAL_VALUES}
            validateOnMount={true}
            onSubmit={submitForm}
            validate={ValidationHandler}
        >
            {(formikProps: FormikProps<typeof INITIAL_VALUES>) => {
                const { setFieldValue } = formikProps;
                changeFieldValue = setFieldValue;
                return (
                    <Form translate="no">
                        <Paper className="container">
                            <Typography variant="h5">
                                {t('user.properties.blockchainAddresses')}
                            </Typography>
                            <Grid style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                                <Typography variant="h6">
                                    {t('user.properties.exchangeAddressTitle')}
                                </Typography>
                                <Box className="buttonAndIconHolder">
                                    {exchangeAddress ? (
                                        <Grid item lg={4} md={10} xs={12}>
                                            <FormInput
                                                property="exchangeDepositAddress"
                                                disabled={true}
                                            />
                                        </Grid>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            disabled={isLoading}
                                            onClick={createExchangeAddress}
                                        >
                                            {t('user.actions.createDepositAddress')}
                                        </Button>
                                    )}
                                    <IconPopover
                                        icon={Info}
                                        iconSize={IconSize.Large}
                                        popoverText={[
                                            t('user.popover.exchangeAddressWhatFor'),
                                            t('user.popover.exchangeAddressHowTo')
                                        ]}
                                        className="infoIcon"
                                    />
                                </Box>
                            </Grid>
                            <Grid style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                                <Typography variant="h6">
                                    {t('user.properties.userBlockchainAddress')}
                                </Typography>

                                {getBlockchainAccount(user) && (
                                    <Grid container>
                                        <Grid item lg={6} md={10} xs={12}>
                                            <FormInput
                                                property="blockchainAccountAddress"
                                                disabled={true}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                                <Box className="buttonAndIconHolder">
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        disabled={isLoading}
                                        onClick={() =>
                                            updateBlockchainAccount(() => {
                                                setFieldValue(
                                                    'blockchainAccountAddress',
                                                    activeBlockchainAccountAddress
                                                );
                                            })
                                        }
                                    >
                                        {!getBlockchainAccount(user)
                                            ? t('user.actions.connectBlockchain')
                                            : t('user.actions.connectNewBlockchain')}
                                    </Button>
                                    <IconPopover
                                        icon={Info}
                                        iconSize={IconSize.Large}
                                        popoverText={[
                                            t('user.popover.blockchainWhatIs'),
                                            t('user.popover.blockchainWhatFor'),
                                            t('user.popover.blockchainHowTo')
                                        ]}
                                        className="infoIcon"
                                    />
                                </Box>
                            </Grid>
                        </Paper>
                    </Form>
                );
            }}
        </Formik>
    );
}
