import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import {
    Box,
    Button,
    createStyles,
    Grid,
    makeStyles,
    Paper,
    Typography,
    useTheme
} from '@material-ui/core';
import {
    DeviceSelectors,
    formatCurrencyComplete,
    getConfiguration,
    LightenColor,
    Moment,
    moment
} from '@energyweb/origin-ui-core';
import { TimeFrame } from '@energyweb/utils-general';
import {
    ANY_OPERATOR,
    ANY_VALUE,
    calculateTotalPrice,
    MarketRedirectFilter
} from '../../utils/exchange';
import { FormikEffect, HierarchicalMultiSelect } from '../Form';
import { OneTimePurchase } from './OneTimePurchase';
import { RepeatedPurchase } from './RepeatedPurchase';
import { useOriginConfiguration } from '../../utils/configuration';
import { getEnvironment } from '../../features/general';

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
    onNotify?: (values: IMarketFormValues) => void;
    onChange: (values: IMarketFormValues) => void;
    currency: string;
    energyUnit: string;
    disableBidding?: boolean;
}

export const Market = memo((props: IProps) => {
    const { onBid, currency, energyUnit, onNotify, onChange, disableBidding } = props;

    const environment = useSelector(getEnvironment);
    const configuration = useSelector(getConfiguration);
    const { t } = useTranslation();

    const originConfiguration = useOriginConfiguration();
    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const originSimpleColor = originConfiguration?.styleConfig?.SIMPLE_TEXT_COLOR;
    const originPrimaryColor = originConfiguration?.styleConfig?.PRIMARY_COLOR;
    const originTextColorDefault = originConfiguration?.styleConfig?.TEXT_COLOR_DEFAULT;
    const bgColorLighten = LightenColor(originBgColor, 5);
    const lowerPaperBgColor = LightenColor(originBgColor, -2);
    const useStyles = makeStyles(() =>
        createStyles({
            disabled: {
                color: originTextColorDefault,
                '&:hover:after': {
                    background: originPrimaryColor
                },
                '&:hover': {
                    color: originSimpleColor
                }
            },
            enabled: {
                color: originSimpleColor,
                '&:after': {
                    background: originPrimaryColor
                },
                '&:hover': {
                    color: originSimpleColor
                }
            }
        })
    );
    const classes = useStyles(useTheme());

    const redirectData = useLocation();
    let changeFieldValue: (name: string, value: any) => void;
    useEffect(() => {
        if (redirectData.state && typeof changeFieldValue === 'function') {
            const {
                redirectDeviceType,
                redirectLocation,
                redirectGridOperator,
                redirectGenerationFrom,
                redirectGenerationTo
            } = redirectData.state as MarketRedirectFilter;

            const locationWithoutCountry =
                redirectLocation[0] !== ANY_VALUE
                    ? redirectLocation.map((location) => {
                          const formattedArr = location.split(';').slice(1).join(';');
                          if (formattedArr.length > 0) {
                              return formattedArr;
                          }
                      })
                    : redirectLocation;

            changeFieldValue('deviceType', redirectDeviceType);
            changeFieldValue('location', locationWithoutCountry);
            changeFieldValue('gridOperator', redirectGridOperator);
            changeFieldValue(
                'generationDateStart',
                redirectGenerationFrom
                    ? moment(redirectGenerationFrom).utcOffset(
                          Number(environment.MARKET_UTC_OFFSET)
                      )
                    : null
            );
            changeFieldValue(
                'generationDateEnd',
                redirectGenerationTo ? moment(redirectGenerationTo) : null
            );
        }
    }, [redirectData]);

    const [oneTimePurchase, setOneTimePurchase] = useState<boolean>(true);
    const [validationSchema, setValidationSchema] = useState();

    return (
        <Grid container className="Market">
            <Grid item xs={12}>
                <Formik
                    initialValues={INITIAL_FORM_VALUES}
                    validationSchema={validationSchema}
                    validateOnMount={false}
                    onSubmit={null}
                >
                    {(formikProps) => {
                        const {
                            isSubmitting,
                            setFieldValue,
                            errors,
                            values,
                            resetForm
                        } = formikProps;

                        changeFieldValue = setFieldValue;

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

                                    <Grid container>
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
                                            inlinePadding={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ul
                                            className="MarketNavigation nav"
                                            style={{ justifyContent: 'center' }}
                                        >
                                            <li
                                                className="PurchaseMenuItem"
                                                style={{ width: '50%', margin: '0' }}
                                            >
                                                <a
                                                    onClick={() => setOneTimePurchase(true)}
                                                    className={
                                                        oneTimePurchase
                                                            ? `${classes.enabled} active`
                                                            : classes.disabled
                                                    }
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
                                                    className={
                                                        !oneTimePurchase
                                                            ? `${classes.enabled} active`
                                                            : classes.disabled
                                                    }
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
                                                    onClick={() => {
                                                        resetForm();
                                                        onBid(values, oneTimePurchase);
                                                    }}
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
        </Grid>
    );
});

Market.displayName = 'Market';
