import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { Skeleton } from '@material-ui/lab';
import { Paper, Typography, Grid, Button, Box } from '@material-ui/core';
import { FormikEffect, HierarchicalMultiSelect } from '../Form';
import {
    getConfiguration,
    Moment,
    useTranslation,
    formatCurrencyComplete,
    DeviceSelectors,
    LightenColor
} from '@energyweb/origin-ui-core';
import { TimeFrame } from '@energyweb/utils-general';
import { calculateTotalPrice, ANY_VALUE, ANY_OPERATOR } from '../../utils/exchange';
import { OneTimePurchase } from './OneTimePurchase';
import { RepeatedPurchase } from './RepeatedPurchase';
import { useOriginConfiguration } from '../../utils/configuration';

export interface IMarketFormValues {
    generationDateStart?: Moment;
    generationDateEnd?: Moment;
    energy?: string;
    demandPeriod?: TimeFrame;
    demandVolume?: string;
    demandDateStart?: Date;
    demandDateEnd?: Date;
    totalDemandVolume?: string;
    price: string;
    deviceType: string[];
    location: string[];
    gridOperator: string[];
}

const INITIAL_FORM_VALUES: IMarketFormValues = {
    energy: '',
    generationDateStart: null,
    generationDateEnd: null,
    price: '',
    deviceType: [ANY_VALUE],
    location: [ANY_VALUE],
    gridOperator: [ANY_OPERATOR],
    demandPeriod: TimeFrame.Daily,
    demandVolume: '',
    demandDateStart: null,
    demandDateEnd: null,
    totalDemandVolume: ''
};

interface IProps {
    onBid: (values: IMarketFormValues, oneTimePurchase: boolean) => void;
    onNotify: (values: IMarketFormValues) => void;
    onChange: (values: IMarketFormValues) => void;
    currency: string;
    energyUnit: string;
    disableBidding?: boolean;
}

export function Market(props: IProps) {
    const { onBid, currency, energyUnit, onNotify, onChange, disableBidding } = props;

    const configuration = useSelector(getConfiguration);
    const { t } = useTranslation();

    const originConfiguration = useOriginConfiguration();
    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;

    const bgColorLighten = LightenColor(originBgColor, 5);
    const lowerPaperBgColor = LightenColor(originBgColor, -2);

    const [oneTimePurchase, setOneTimePurchase] = useState<boolean>(true);
    const [validationSchema, setValidationSchema] = useState();

    if (!configuration?.deviceTypeService?.deviceTypes) {
        return <Skeleton variant="rect" height={200} />;
    }

    const initialFormValues = INITIAL_FORM_VALUES;

    return (
        <Grid container className="Market">
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={validationSchema}
                    validateOnMount={false}
                    onSubmit={null}
                >
                    {(formikProps) => {
                        const { isSubmitting, setFieldValue, errors, values } = formikProps;

                        const totalPrice = oneTimePurchase
                            ? calculateTotalPrice(values.price, values.energy)
                            : calculateTotalPrice(values.price, values.totalDemandVolume);

                        const fieldDisabled = isSubmitting;

                        const notifyButtonEnabled = false;
                        const bidButtonEnabled = oneTimePurchase
                            ? values.price &&
                              values.energy &&
                              !errors?.price &&
                              !errors?.energy &&
                              !disableBidding &&
                              !isSubmitting
                            : values.demandPeriod &&
                              values.demandVolume &&
                              values.demandDateStart &&
                              values.demandDateEnd &&
                              values.totalDemandVolume &&
                              values.price &&
                              !disableBidding &&
                              !isSubmitting;

                        return (
                            <Form translate="no">
                                <FormikEffect
                                    onChange={(askProps: IMarketFormValues) => {
                                        onChange(
                                            Object.fromEntries(
                                                Object.entries(askProps).map(([name, prop]) =>
                                                    prop?.some &&
                                                    prop.some((p) =>
                                                        [ANY_VALUE, ANY_OPERATOR].includes(p)
                                                    )
                                                        ? [name, []]
                                                        : [name, prop]
                                                )
                                            ) as IMarketFormValues
                                        );
                                    }}
                                />
                                <Paper
                                    className="MarketUpperPaper"
                                    style={{
                                        borderBottom: `4px solid ${bgColorLighten}`
                                    }}
                                >
                                    <Typography variant="h5" className="MarketTitle">
                                        {t('exchange.info.market')}
                                    </Typography>

                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <HierarchicalMultiSelect
                                                selectedValue={values.deviceType}
                                                onChange={(value: string[]) => {
                                                    const { deviceType } = values;
                                                    value =
                                                        (value.includes(ANY_VALUE) &&
                                                            !deviceType.includes(ANY_VALUE)) ||
                                                        value.length === 0
                                                            ? [ANY_VALUE]
                                                            : value.filter((v) => v !== ANY_VALUE);
                                                    setFieldValue('deviceType', value);
                                                }}
                                                allValues={configuration.deviceTypeService.deviceTypes.concat(
                                                    [[ANY_VALUE]]
                                                )}
                                                selectOptions={[
                                                    {
                                                        label: t('device.properties.deviceType'),
                                                        placeholder: t(
                                                            'device.info.selectDeviceType'
                                                        )
                                                    },
                                                    {
                                                        label: t('device.properties.deviceType'),
                                                        placeholder: t(
                                                            'device.info.selectDeviceType'
                                                        )
                                                    },
                                                    {
                                                        label: t('device.properties.deviceType'),
                                                        placeholder: t(
                                                            'device.info.selectDeviceType'
                                                        )
                                                    }
                                                ]}
                                                disabled={fieldDisabled}
                                            />
                                        </Grid>
                                        <DeviceSelectors
                                            location={values.location}
                                            onLocationChange={(value) => {
                                                const { location } = values;
                                                value =
                                                    (value.includes(ANY_VALUE) &&
                                                        !location.includes(ANY_VALUE)) ||
                                                    value.length === 0
                                                        ? [ANY_VALUE]
                                                        : value.filter((v) => v !== ANY_VALUE);
                                                setFieldValue(
                                                    'location',
                                                    value.length === 0 ? [ANY_VALUE] : value
                                                );
                                            }}
                                            gridOperator={values.gridOperator}
                                            onGridOperatorChange={(value) => {
                                                const { gridOperator } = values;
                                                value =
                                                    (value.includes(ANY_OPERATOR) &&
                                                        !gridOperator.includes(ANY_OPERATOR)) ||
                                                    value.length === 0
                                                        ? [ANY_OPERATOR]
                                                        : value.filter((v) => v !== ANY_OPERATOR);
                                                setFieldValue(
                                                    'gridOperator',
                                                    value.length === 0 ? [ANY_OPERATOR] : value
                                                );
                                            }}
                                            disabled={fieldDisabled}
                                        ></DeviceSelectors>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ul
                                            className="NavMenu nav"
                                            style={{ justifyContent: 'center' }}
                                        >
                                            <li
                                                className="PurchaseMenuItem"
                                                style={{ width: '50%', margin: '0' }}
                                            >
                                                <a
                                                    onClick={() => setOneTimePurchase(true)}
                                                    className={oneTimePurchase ? 'active' : ''}
                                                >
                                                    {t('exchange.actions.oneTimePurchase')}
                                                </a>
                                            </li>
                                            <li
                                                className="PurchaseMenuItem"
                                                style={{ width: '50%', margin: '0' }}
                                            >
                                                <a
                                                    onClick={() => setOneTimePurchase(false)}
                                                    className={!oneTimePurchase ? 'active' : ''}
                                                >
                                                    {t('exchange.actions.repeatedPurchase')}
                                                </a>
                                            </li>
                                        </ul>
                                    </Grid>
                                </Paper>

                                <Paper
                                    className="MarketLowerPaper"
                                    style={{ backgroundColor: lowerPaperBgColor }}
                                >
                                    {oneTimePurchase ? (
                                        <OneTimePurchase
                                            fieldDisabled={fieldDisabled}
                                            currency={currency}
                                            setFieldValue={setFieldValue}
                                            energyUnit={energyUnit}
                                            setValidationSchema={setValidationSchema}
                                        />
                                    ) : (
                                        <RepeatedPurchase
                                            fieldDisabled={fieldDisabled}
                                            currency={currency}
                                            setFieldValue={setFieldValue}
                                            energyUnit={energyUnit}
                                            values={values}
                                            setValidationSchema={setValidationSchema}
                                        />
                                    )}
                                    <br />
                                    <Grid container spacing={3}>
                                        <Grid item xs={6}>
                                            <Typography className="TotalPriceTitle">
                                                {t('exchange.feedback.total')}:{' '}
                                            </Typography>
                                            <Typography className="TotalPriceContent">
                                                {formatCurrencyComplete(totalPrice, currency)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box display="flex" justifyContent="flex-end">
                                                {notifyButtonEnabled && (
                                                    <Button
                                                        color="primary"
                                                        variant="outlined"
                                                        disabled={!notifyButtonEnabled}
                                                        onClick={() => onNotify(values)}
                                                    >
                                                        {t('exchange.actions.notify')}
                                                    </Button>
                                                )}
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    disabled={!bidButtonEnabled}
                                                    onClick={() => onBid(values, oneTimePurchase)}
                                                >
                                                    {t('exchange.actions.placeBidOrder')}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Form>
                        );
                    }}
                </Formik>
            </Grid>
            <Grid item xs={3}></Grid>
        </Grid>
    );
}
