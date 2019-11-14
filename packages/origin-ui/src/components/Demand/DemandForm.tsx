import React, { useEffect, useState } from 'react';
import { Role } from '@energyweb/user-registry';
import {
    Currency,
    TimeFrame,
    THAILAND_REGIONS_PROVINCES_MAP,
    IRECAssetService
} from '@energyweb/utils-general';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Paper,
    Typography,
    FormControl,
    InputLabel,
    FilledInput,
    MenuItem,
    Grid,
    Button,
    Tooltip
} from '@material-ui/core';
import { getEnumValues, dataTest } from '../../utils/helper';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration } from '../../features/selectors';
import './DemandForm.scss';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';
import moment, { Moment } from 'moment';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { Select, TextField, CheckboxWithLabel } from 'formik-material-ui';
import { Demand } from '@energyweb/market';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../../utils/routing';
import { FormikDatePicker } from '../FormikDatePicker';
import { getCurrentUser } from '../../features/users/selectors';
import { setLoading } from '../../features/general/actions';
import { HierarchicalMultiSelect } from '../HierarchicalMultiSelect';
import { Skeleton } from '@material-ui/lab';

const REPEATABLE_TIMEFRAMES = [
    {
        label: 'Day',
        value: TimeFrame.daily
    },
    {
        label: 'Week',
        value: TimeFrame.weekly
    },
    {
        label: 'Month',
        value: TimeFrame.monthly
    },
    {
        label: 'Year',
        value: TimeFrame.yearly
    }
];

interface IFormValues {
    demandNeedsInMWh: string;
    maxPricePerMWh: string;
    currency: keyof typeof Currency | '';
    timeframe: TimeFrame | '';
    startDate: Moment;
    endDate: Moment;
    activeUntilDate: Moment;
    procureFromSingleFacility: boolean;
}

const INITIAL_FORM_VALUES: IFormValues = {
    demandNeedsInMWh: '',
    maxPricePerMWh: '',
    currency: '',
    timeframe: '',
    activeUntilDate: null,
    startDate: null,
    endDate: null,
    procureFromSingleFacility: false
};

interface IProps {
    demand?: Demand.Entity;
    edit?: boolean;
    clone?: boolean;
    readOnly?: boolean;
}

const DEFAULT_VINTAGE_RANGE: [number, number] = [1970, moment().year()];

const DEFAULT_COUNTRY = 'Thailand';

export function DemandForm(props: IProps) {
    const currentUser = useSelector(getCurrentUser);
    const configuration = useSelector(getConfiguration);
    const dispatch = useDispatch();
    const { getDemandViewLink } = useLinks();

    const irecAssetService = new IRECAssetService();

    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedAssetType, setSelectedAssetType] = useState([]);
    const [initialFormValuesFromDemand, setInitialFormValuesFromDemand] = useState(null);
    const [vintage, setVintage] = useState(null);
    const history = useHistory();

    const { edit, demand, clone, readOnly } = props;

    useEffect(() => {
        function setupFormBasedOnDemand() {
            const newInitialFormValuesFromDemand: IFormValues = {
                currency: Currency[demand.offChainProperties.currency] as IFormValues['currency'],
                startDate: moment.unix(demand.offChainProperties.startTime),
                endDate: moment.unix(demand.offChainProperties.endTime),
                activeUntilDate: moment.unix(demand.offChainProperties.endTime),
                demandNeedsInMWh: Math.round(
                    demand.offChainProperties.energyPerTimeFrame / 1000000
                ).toString(),
                maxPricePerMWh: Math.round(
                    demand.offChainProperties.maxPricePerMwh / 100
                ).toString(),
                procureFromSingleFacility: demand.offChainProperties.procureFromSingleFacility,
                timeframe: demand.offChainProperties.timeFrame
            };

            setInitialFormValuesFromDemand(newInitialFormValuesFromDemand);

            if (
                demand.offChainProperties.vintage &&
                demand.offChainProperties.vintage.length === 2
            ) {
                setVintage(demand.offChainProperties.vintage);
            }

            if (
                demand.offChainProperties.assetType &&
                demand.offChainProperties.assetType.length > 0
            ) {
                setSelectedAssetType(demand.offChainProperties.assetType);
            }

            if (
                demand.offChainProperties.location &&
                demand.offChainProperties.location.length > 0
            ) {
                setSelectedLocation(
                    demand.offChainProperties.location.map(location =>
                        location.replace(`${DEFAULT_COUNTRY};`, '')
                    )
                );
            }
        }

        if (demand) {
            setupFormBasedOnDemand();
        }
    }, [demand]);

    function totalDemand(
        startDate: IFormValues['startDate'],
        endDate: IFormValues['endDate'],
        demandNeedsInMWh: IFormValues['demandNeedsInMWh'],
        timeframe: IFormValues['timeframe']
    ) {
        if (!endDate || !demandNeedsInMWh || !startDate || timeframe === '') {
            return 0;
        }

        return Demand.calculateTotalEnergyDemand(
            startDate.unix(),
            endDate.unix(),
            parseInt(demandNeedsInMWh, 10) * 1000000,
            timeframe
        );
    }

    const currencies = getEnumValues(Currency).filter(curr => Currency[curr] !== Currency.NONE);

    const isUserTraderRole = currentUser && currentUser.isRole(Role.Trader);

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (values.timeframe === '' || values.currency === '') {
            return;
        }

        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        const offChainProps: Demand.IDemandOffChainProperties = {
            currency: Currency[values.currency as keyof typeof Currency],
            startTime: values.startDate.unix(),
            endTime: values.endDate.unix(),
            timeFrame: values.timeframe,
            maxPricePerMwh: Math.round(parseFloat(values.maxPricePerMWh) * 100),
            energyPerTimeFrame: Math.round(parseFloat(values.demandNeedsInMWh) * 1000000)
        };

        if (values.procureFromSingleFacility) {
            offChainProps.procureFromSingleFacility = values.procureFromSingleFacility;
        }

        if (selectedAssetType && selectedAssetType.length > 0) {
            offChainProps.assetType = selectedAssetType;
        }

        if (selectedLocation && selectedLocation.length > 0) {
            offChainProps.location = selectedLocation.map(
                location => `${DEFAULT_COUNTRY};${location}`
            );
        }

        if (
            vintage &&
            vintage.length === 2 &&
            (vintage[0] !== DEFAULT_VINTAGE_RANGE[0] || vintage[1] !== DEFAULT_VINTAGE_RANGE[1])
        ) {
            offChainProps.vintage = vintage;
        }

        try {
            if (edit) {
                await demand.update(offChainProps);

                showNotification('Demand edited', NotificationType.Success);
            } else {
                const createdDemand = await Demand.createDemand(offChainProps, configuration);

                showNotification('Demand created', NotificationType.Success);

                history.push(getDemandViewLink(createdDemand.id));
            }
        } catch (error) {
            console.error('Demand form error', error);
            showNotification(`Can't save demand`, NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    let initialFormValues: IFormValues = null;

    if (edit || clone || readOnly) {
        initialFormValues = initialFormValuesFromDemand;
    } else {
        initialFormValues = INITIAL_FORM_VALUES;
    }

    if (!initialFormValues) {
        return <Skeleton variant="rect" height={200} />;
    }

    let submitButtonText: string;

    if (edit) {
        submitButtonText = 'Save demand';
    } else if (!readOnly) {
        submitButtonText = 'Create demand';
    }

    return (
        <Paper className="DemandForm">
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={Yup.object().shape({
                    demandNeedsInMWh: Yup.number()
                        .label('Demand needs (MWh)')
                        .required('Required')
                        .positive('Number has to be positive'),
                    maxPricePerMWh: Yup.number()
                        .label('Max price (per MWh)')
                        .required('Required')
                        .positive('Number has to be positive'),
                    currency: Yup.string()
                        .label('Currency')
                        .required(),
                    timeframe: Yup.number()
                        .label('Timeframe')
                        .min(0)
                        .required(),
                    startDate: Yup.date().required(),
                    endDate: Yup.date().required(),
                    activeUntilDate: Yup.date().required(),
                    procureFromSingleFacility: Yup.boolean()
                })}
                isInitialValid={edit || clone || readOnly}
            >
                {formikProps => {
                    const { values, isValid, isSubmitting } = formikProps;

                    const disabled = isSubmitting || readOnly;

                    let buttonTooltip = '';

                    if (isSubmitting) {
                        buttonTooltip = 'Form is submitting. Please wait.';
                    } else if (!isValid) {
                        buttonTooltip = `Form needs to be valid to proceed.`;
                    } else if (!isUserTraderRole) {
                        buttonTooltip = 'You need to have a Trader role to create a demand.';
                    }

                    return (
                        <Form {...dataTest('demandForm')}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">General</Typography>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('demandNeedsInMWh')}
                                    >
                                        <Field
                                            label="Demand needs (MWh)"
                                            name="demandNeedsInMWh"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('maxPricePerMWh')}
                                    >
                                        <Field
                                            label="Max price (per MWh)"
                                            name="maxPricePerMWh"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('currency')}
                                    >
                                        <InputLabel required>Currency</InputLabel>
                                        <Field
                                            name="currency"
                                            label="Currency"
                                            component={Select}
                                            input={<FilledInput value={values.currency} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                            disabled={disabled}
                                        >
                                            {currencies.map(option => (
                                                <MenuItem value={option} key={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>
                                    <Field
                                        name="startDate"
                                        label="Start date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={disabled}
                                        {...dataTest('startDate')}
                                    />
                                    <Field
                                        name="activeUntilDate"
                                        label="Active until date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={disabled}
                                        {...dataTest('activeUntilDate')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        Producing Asset Criteria
                                    </Typography>
                                    <HierarchicalMultiSelect
                                        selectedValue={selectedAssetType}
                                        onChange={(value: string[]) => setSelectedAssetType(value)}
                                        allValues={irecAssetService.AssetTypes}
                                        selectOptions={[
                                            {
                                                label: 'Asset type',
                                                placeholder: 'Select asset type'
                                            },
                                            {
                                                label: 'Asset type',
                                                placeholder: 'Select asset type'
                                            },
                                            {
                                                label: 'Asset type',
                                                placeholder: 'Select asset type'
                                            }
                                        ]}
                                        readOnly={readOnly}
                                        disabled={disabled}
                                    />
                                    <div className="Filter_menu_item_sliderWrapper mt-3">
                                        <InputLabel shrink={true}>
                                            Vintage (year of asset construction)
                                        </InputLabel>
                                        <CustomSlider
                                            valueLabelDisplay="on"
                                            defaultValue={vintage || DEFAULT_VINTAGE_RANGE}
                                            min={DEFAULT_VINTAGE_RANGE[0]}
                                            max={DEFAULT_VINTAGE_RANGE[1]}
                                            ThumbComponent={CustomSliderThumbComponent}
                                            onChangeCommitted={(event, value: [number, number]) =>
                                                setVintage(value)
                                            }
                                            disabled={disabled}
                                        />
                                    </div>

                                    <Field
                                        name="procureFromSingleFacility"
                                        Label={{
                                            label: 'Procure from single facility'
                                        }}
                                        color="primary"
                                        component={CheckboxWithLabel}
                                        disabled={disabled}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Repeatable</Typography>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('timeframe')}
                                    >
                                        <InputLabel required>Every</InputLabel>
                                        <Field
                                            name="timeframe"
                                            label="Timeframe"
                                            component={Select}
                                            input={<FilledInput value={values.timeframe} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                            disabled={disabled}
                                        >
                                            {REPEATABLE_TIMEFRAMES.map(timeframe => (
                                                <MenuItem
                                                    value={timeframe.value}
                                                    key={timeframe.value}
                                                >
                                                    {timeframe.label}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>

                                    <Field
                                        name="endDate"
                                        label="End date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={disabled}
                                        {...dataTest('endDate')}
                                    />

                                    <div className="mt-3">
                                        Total demand:{' '}
                                        <b {...dataTest('totalDemand')}>
                                            {(
                                                totalDemand(
                                                    values.startDate,
                                                    values.endDate,
                                                    values.demandNeedsInMWh,
                                                    values.timeframe
                                                ) / 1000000
                                            ).toLocaleString()}{' '}
                                            MWh
                                        </b>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        Producing Asset Location
                                    </Typography>
                                    <HierarchicalMultiSelect
                                        selectedValue={selectedLocation}
                                        onChange={(value: string[]) => setSelectedLocation(value)}
                                        options={THAILAND_REGIONS_PROVINCES_MAP}
                                        selectOptions={[
                                            {
                                                label: 'Regions',
                                                placeholder: 'Select multiple regions'
                                            },
                                            {
                                                label: 'Provinces',
                                                placeholder: 'Select multiple provinces'
                                            }
                                        ]}
                                        readOnly={readOnly}
                                        disabled={disabled}
                                    />
                                </Grid>
                            </Grid>

                            {submitButtonText && (
                                <Tooltip
                                    title={buttonTooltip}
                                    disableHoverListener={!buttonTooltip}
                                    {...dataTest('submitButtonTooltip')}
                                >
                                    <span>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            className="mt-3 right"
                                            disabled={disabled || !isValid || !isUserTraderRole}
                                            {...dataTest('submitButton')}
                                        >
                                            {submitButtonText}
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
