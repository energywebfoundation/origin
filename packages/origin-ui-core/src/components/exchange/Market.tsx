import React from 'react';
import {
    Paper,
    Typography,
    Grid,
    makeStyles,
    createStyles,
    useTheme,
    Divider,
    InputAdornment,
    Button
} from '@material-ui/core';
import { HierarchicalMultiSelect } from '../HierarchicalMultiSelect';
import { useSelector } from 'react-redux';
import { getConfiguration, getRegions } from '../../features';
import { Skeleton } from '@material-ui/lab';
import {
    useValidation,
    moment,
    Moment,
    setMaxTimeInMonth,
    setMinTimeInMonth,
    useTranslation
} from '../../utils';
import { Formik, Field, Form } from 'formik';
import { FormInput, FormikDatePickerWithArrows, FormikEffect } from '../Form';

interface IFormValues {
    generationDateStart: Moment;
    generationDateEnd: Moment;
    price: string;
    energy: string;
    deviceType: string[];
    location: string[];
}

const INITIAL_FORM_VALUES: IFormValues = {
    energy: '',
    generationDateEnd: setMaxTimeInMonth(moment()),
    generationDateStart: setMinTimeInMonth(moment()),
    price: '',
    deviceType: [],
    location: []
};

interface IProps {
    onBid: (values: IFormValues) => void;
    onNotify: (values: IFormValues) => void;
    onChange: (values: IFormValues) => void;
    currency: string;
    energyUnit: string;
}

export function Market(props: IProps) {
    const { onBid, currency, energyUnit, onNotify, onChange } = props;

    const configuration = useSelector(getConfiguration);
    const regions = useSelector(getRegions);

    const { t } = useTranslation();

    const useStyles = makeStyles(() =>
        createStyles({
            wrapper: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());
    const { Yup } = useValidation();

    const VALIDATION_SCHEMA = Yup.object().shape({
        generationDateEnd: Yup.date()
            .required()
            .label(t('exchange.properties.generationDateEnd')),
        generationDateStart: Yup.date()
            .required()
            .label(t('exchange.properties.generationDateStart')),
        energy: Yup.number()
            .required()
            .positive()
            .integer()
            .label(t('exchange.properties.energy')),
        price: Yup.number()
            .required()
            .positive()
            .min(0.01)
            .label(t('exchange.properties.price'))
    });

    if (!configuration?.deviceTypeService?.deviceTypes) {
        return <Skeleton variant="rect" height={200} />;
    }

    const initialFormValues = INITIAL_FORM_VALUES;

    function calculateTotalPrice(price: string, energy: string) {
        const priceAsFloat = parseFloat(price);
        const energyAsFloat = parseFloat(energy);

        if (isNaN(priceAsFloat) || isNaN(energyAsFloat) || !priceAsFloat || !energyAsFloat) {
            return 0;
        }

        return (priceAsFloat * energyAsFloat).toFixed(2);
    }

    return (
        <Paper className={classes.wrapper}>
            <Formik
                initialValues={initialFormValues}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
                onSubmit={null}
            >
                {formikProps => {
                    const { isValid, isSubmitting, values, setFieldValue, errors } = formikProps;

                    const totalPrice = isValid
                        ? calculateTotalPrice(values.price, values.energy)
                        : 0;

                    const fieldDisabled = isSubmitting;

                    const notifyButtonEnabled = values.price && !errors?.price && !isSubmitting;
                    const bidButtonEnabled =
                        values.price &&
                        values.energy &&
                        !errors?.price &&
                        !errors?.energy &&
                        !isSubmitting;

                    const DatePickerWithArrows = ({
                        name,
                        label
                    }: {
                        name: string;
                        label: string;
                    }) => (
                        <Field
                            name={name}
                            label={label}
                            inputVariant="filled"
                            variant="inline"
                            fullWidth
                            required
                            component={FormikDatePickerWithArrows}
                            disabled={fieldDisabled}
                            views={['year', 'month']}
                            format={null}
                            onLeftArrowClick={() =>
                                setFieldValue(
                                    name,
                                    (values[name] as Moment)
                                        .clone()
                                        .subtract(1, 'month')
                                        .startOf('month')
                                )
                            }
                            onRightArrowClick={() =>
                                setFieldValue(
                                    name,
                                    (values[name] as Moment)
                                        .clone()
                                        .add(1, 'month')
                                        .endOf('month')
                                )
                            }
                        />
                    );

                    return (
                        <Form>
                            <FormikEffect onChange={onChange} />
                            <Typography variant="h4">{t('exchange.info.market')}</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <HierarchicalMultiSelect
                                        selectedValue={values.deviceType}
                                        onChange={(value: string[]) =>
                                            setFieldValue('deviceType', value)
                                        }
                                        allValues={configuration.deviceTypeService.deviceTypes}
                                        selectOptions={[
                                            {
                                                label: t('device.properties.deviceType'),
                                                placeholder: t('device.info.selectDeviceType')
                                            }
                                        ]}
                                        disabled={fieldDisabled}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <HierarchicalMultiSelect
                                        selectedValue={values.location}
                                        onChange={(value: string[]) =>
                                            setFieldValue('location', value)
                                        }
                                        options={regions}
                                        selectOptions={[
                                            {
                                                label: t('exchange.info.regions'),
                                                placeholder: t(
                                                    'exchange.info.selectMultipleRegions'
                                                )
                                            }
                                        ]}
                                        disabled={fieldDisabled}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <DatePickerWithArrows
                                        name="generationDateStart"
                                        label={t('exchange.properties.generationDateStart')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <DatePickerWithArrows
                                        name="generationDateEnd"
                                        label={t('exchange.properties.generationDateEnd')}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Divider variant="middle" />
                            <br />
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        label={t('exchange.properties.energy')}
                                        property="energy"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        variant="standard"
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {energyUnit}
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        label={t('exchange.properties.price')}
                                        property="price"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        variant="standard"
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {currency}
                                                </InputAdornment>
                                            )
                                        }}
                                        formControlProps={{
                                            onBlur: e => {
                                                const parsedValue = parseFloat(
                                                    (e.target as any)?.value
                                                );

                                                if (!isNaN(parsedValue) && parsedValue > 0) {
                                                    setFieldValue(
                                                        'price',
                                                        (
                                                            Math.floor(parsedValue * 100) / 100
                                                        ).toFixed(2)
                                                    );
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography>
                                        {t('exchange.feedback.total')}: {totalPrice}
                                        {currency}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        disabled={!notifyButtonEnabled}
                                        onClick={() => onNotify(values)}
                                    >
                                        {t('exchange.actions.notify')}
                                    </Button>
                                    <Button
                                        disabled={!bidButtonEnabled}
                                        onClick={() => onBid(values)}
                                    >
                                        {t('exchange.actions.bid')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
