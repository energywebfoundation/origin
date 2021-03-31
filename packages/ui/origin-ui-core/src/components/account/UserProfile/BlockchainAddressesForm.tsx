import React, { memo, ReactElement } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { Form, Formik } from 'formik';
import { FormInput } from '../../Form';
import { IconPopover, IconSize } from '../../Icons';
import { useTranslation } from 'react-i18next';
import { IUser } from '@energyweb/origin-backend-core';
import {
    IBlockchainAddressesFormDataSchema,
    ValidationHandlerReturnType
} from './BlockchainAddressesContainer/types';

interface IProps {
    exchangeAddress: string;
    user: IUser;
    formData: IBlockchainAddressesFormDataSchema;
    onCreateExchangeAddress: () => void;
    isLoading: boolean;
    onUpdateBlockchainAccount: () => void;
    handleValidation: ValidationHandlerReturnType;
}

export const BlockchainAddressesForm = memo(
    (props: IProps): ReactElement => {
        const { t } = useTranslation();
        const {
            onUpdateBlockchainAccount,
            onCreateExchangeAddress,
            isLoading,
            exchangeAddress,
            user,
            formData,
            handleValidation
        } = props;
        return (
            <Formik
                initialValues={formData}
                validateOnMount={true}
                onSubmit={() => null}
                validate={handleValidation}
            >
                {(formikProps) => {
                    const { setFieldValue, values } = formikProps;

                    if (values.exchangeDepositAddress !== exchangeAddress) {
                        setFieldValue('exchangeDepositAddress', exchangeAddress);
                    }

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
                                                onClick={onCreateExchangeAddress}
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
                                            onClick={() => {
                                                onUpdateBlockchainAccount();
                                            }}
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
);

BlockchainAddressesForm.displayName = 'BlockchainAddressesForm';
