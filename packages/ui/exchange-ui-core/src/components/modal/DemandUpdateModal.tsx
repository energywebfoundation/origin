import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik, FormikHelpers, Form } from 'formik';
import * as Yup from 'yup';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Grid,
    Typography,
    Switch,
    InputAdornment,
    Divider
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import {
    EnergyFormatter,
    fromGeneralSelectors,
    LightenColor,
    moment
} from '@energyweb/origin-ui-core';
import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { updateDemand, pauseDemand, resumeDemand } from '../../features';
import { Demand, IProductDTO, Order, periodTypeOptions } from '../../utils';
import { CalendarFieldOnPeriod, FormInput, FormSelect } from '../Form';
import { TotalDemandVolume } from '../orders';
import { useOriginConfiguration } from '../../utils/configuration';

interface IFormValues {
    userId: string;
    id: string;
    periodTimeFrame: TimeFrame;
    start: Date;
    end: Date;
    volumePerPeriod: string;
    price: string;
    product: IProductDTO;
    bids: Order[];
    status: DemandStatus;
}

const INITIAL_FORM_VALUES: IFormValues = {
    userId: '',
    id: '',
    periodTimeFrame: TimeFrame.Daily,
    start: null,
    end: null,
    volumePerPeriod: '',
    price: '',
    product: {},
    bids: [],
    status: null
};

interface IProps {
    demand: Demand;
    close: () => void;
}

export function DemandUpdateModal(props: IProps) {
    const { demand, close } = props;
    const initialStatus = demand.status === DemandStatus.ACTIVE;
    const [demandStatus, setDemandStatus] = useState<boolean>(initialStatus);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currencies = useSelector(fromGeneralSelectors.getCurrencies);
    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';
    const periodOptions = periodTypeOptions(t, false);

    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgLighten = LightenColor(originBgColor, 5);

    async function updateStatus(id, status) {
        const newStatus = !status;
        setDemandStatus(newStatus);
        if (status) {
            dispatch(pauseDemand(id));
            close();
        } else {
            dispatch(resumeDemand(id));
            close();
        }
    }

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(
            updateDemand(values.id, {
                price: parseFloat(values.price) * 100,
                volumePerPeriod: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    parseFloat(values.volumePerPeriod)
                ).toString(),
                periodTimeFrame: values.periodTimeFrame,
                start: moment(values.start).toISOString(),
                end: moment(values.end).toISOString(),
                product: values.product,
                boundToGenerationTime: false,
                excludeEnd: false
            })
        );
        formikActions.setSubmitting(false);
        close();
    }

    const VALIDATION_SCHEMA = Yup.object().shape({
        periodTimeFrame: Yup.string().label(t('demand.properties.period')),
        volumePerPeriod: Yup.number()
            .required()
            .positive()
            .integer()
            .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.')))
            .label(t('demand.properties.volume')),
        start: Yup.date().label(t('demand.properties.start')),
        end: Yup.date().label(t('demand.properties.end')),
        price: Yup.number().required().positive().min(0.01).label(t('demand.properties.price'))
    });

    const initialFormValues: IFormValues = {
        ...demand,
        volumePerPeriod: EnergyFormatter.format(Number(demand?.volumePerPeriod)),
        price: (parseFloat(demand?.price) / 100).toFixed(2)
    };

    return (
        <Formik
            initialValues={initialFormValues}
            onSubmit={submitForm}
            validationSchema={VALIDATION_SCHEMA}
        >
            {(formikProps) => {
                const { isValid, isSubmitting, dirty, values } = formikProps;

                const buttonDisabled = !dirty || isSubmitting || !isValid;

                return (
                    <Form translate="no">
                        <Dialog
                            open={demand !== null}
                            onClose={close}
                            maxWidth="xs"
                            fullWidth
                            className="DemandUpdateModal"
                        >
                            <DialogTitle>
                                <Box className="Title">
                                    {t('demand.captions.updateDemand')}
                                    <Close onClick={close} style={{ cursor: 'pointer' }} />
                                </Box>
                            </DialogTitle>
                            <DialogContent>
                                <Grid container>
                                    <Grid item xs={12} className="TotalVolume">
                                        <TotalDemandVolume demand={values} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            className="ActivateDemand"
                                            style={{ backgroundColor: bgLighten }}
                                        >
                                            <Typography>
                                                {t('demand.captions.activateDemand')}
                                            </Typography>
                                            <Switch
                                                color="primary"
                                                checked={demandStatus}
                                                onChange={() =>
                                                    updateStatus(values.id, demandStatus)
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        className="FieldsHolder"
                                        style={{ backgroundColor: bgLighten }}
                                    >
                                        <Grid item xs={12}>
                                            <FormSelect
                                                options={periodOptions}
                                                label={t('demand.properties.period')}
                                                property="periodTimeFrame"
                                                currentValue={values.periodTimeFrame}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                        <Grid container className="CalendarContainer">
                                            <Grid item xs={12}>
                                                <CalendarFieldOnPeriod
                                                    name={'start'}
                                                    label={t('demand.properties.start')}
                                                    period={values.periodTimeFrame}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <CalendarFieldOnPeriod
                                                    name={'end'}
                                                    label={t('demand.properties.end')}
                                                    period={values.periodTimeFrame}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormInput
                                                label={t('demand.properties.volume')}
                                                property="volumePerPeriod"
                                                className="mt-3 VolumeAndPriceFields"
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment
                                                            className="Adornment"
                                                            position="end"
                                                        >
                                                            {EnergyFormatter.displayUnit}
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormInput
                                                label={t('demand.properties.price')}
                                                property="price"
                                                className="mt-3 VolumeAndPriceFields"
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment
                                                            className="Adornment"
                                                            position="end"
                                                        >
                                                            {defaultCurrency}
                                                        </InputAdornment>
                                                    )
                                                }}
                                                wrapperProps={{
                                                    onBlur: (e) => {
                                                        const parsedValue = parseFloat(
                                                            (e.target as any)?.value
                                                        );

                                                        if (
                                                            !isNaN(parsedValue) &&
                                                            parsedValue > 0
                                                        ) {
                                                            values.price = parsedValue.toFixed(2);
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <Divider
                                variant="fullWidth"
                                className="divider"
                                style={{ backgroundColor: bgLighten }}
                            />
                            <DialogActions className="ButtonContainer">
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => {
                                        formikProps.submitForm();
                                    }}
                                    disabled={buttonDisabled}
                                >
                                    {t('demand.actions.update')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Form>
                );
            }}
        </Formik>
    );
}
