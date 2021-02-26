import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { Form, Formik, FormikProps, yupToFormErrors } from 'formik';
import { getLoading } from '../../../features/general';
import {
    createExchangeDepositAddress,
    getActiveBlockchainAccountAddress,
    getExchangeDepositAddress,
    getUserOffchain,
    updateUserBlockchain
} from '../../../features/users';
import { useValidation } from '../../../utils/validation';
import { FormInput } from '../../Form';
import { IconPopover, IconSize } from '../../Icons';

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
        blockchainAccountAddress: user.blockchainAccountAddress || '',
        exchangeDepositAddress: exchangeAddress || ''
    };

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
            onSubmit={() => null}
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
                                        <Grid item lg={6} md={10} xs={12}>
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

                                {user?.blockchainAccountAddress && (
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
                                        {!user?.blockchainAccountAddress
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
