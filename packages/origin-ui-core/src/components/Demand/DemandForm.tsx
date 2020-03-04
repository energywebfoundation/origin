import React, { useEffect, useState } from 'react';
import { Role } from '@energyweb/user-registry';
import { TimeFrame } from '@energyweb/utils-general';
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
import { DemandUpdateData, DemandPostData } from '@energyweb/origin-backend-core';
import { dataTest } from '../../utils/helper';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration } from '../../features/selectors';
import { getRegions, getCurrencies, getCountry } from '../../features/general/selectors';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';
import moment, { Moment } from 'moment';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { Select, TextField, CheckboxWithLabel } from 'formik-material-ui';
import { Demand } from '@energyweb/market';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../../utils/routing';
import { FormikDatePicker } from '../Form/FormikDatePicker';
import { getCurrentUser } from '../../features/users/selectors';
import { setLoading } from '../../features/general/actions';

import { HierarchicalMultiSelect } from '../HierarchicalMultiSelect';
import { Skeleton } from '@material-ui/lab';
import { EnergyFormatter } from '../../utils/EnergyFormatter';

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
    demandNeedsInDisplayUnit: string;
    maxPricePerMWh: string;
    currency: string | '';
    timeframe: TimeFrame | '';
    startDate: Moment;
    endDate: Moment;
    procureFromSingleFacility: boolean;
    automaticMatching: boolean;
}

const INITIAL_FORM_VALUES: IFormValues = {
    demandNeedsInDisplayUnit: '',
    maxPricePerMWh: '',
    currency: '',
    timeframe: '',
    startDate: null,
    endDate: null,
    procureFromSingleFacility: false,
    automaticMatching: true
};

interface IProps {
    demand?: Demand.Entity;
    edit?: boolean;
    clone?: boolean;
    readOnly?: boolean;
}

const DEFAULT_VINTAGE_RANGE: [number, number] = [1970, moment().year()];

export function DemandForm(props: IProps) {
    const currentUser = useSelector(getCurrentUser);
    const configuration = useSelector(getConfiguration);
    const currencies = useSelector(getCurrencies);
    const regions = useSelector(getRegions);
    const country = useSelector(getCountry);

    const dispatch = useDispatch();
    const { getDemandViewLink } = useLinks();

    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedDeviceType, setSelectedDeviceType] = useState([]);
    const [initialFormValuesFromDemand, setInitialFormValuesFromDemand] = useState(null);
    const [vintage, setVintage] = useState(null);
    const history = useHistory();

    const { edit, demand, clone, readOnly } = props;

    useEffect(() => {
        function setupFormBasedOnDemand() {
            const newInitialFormValuesFromDemand: IFormValues = {
                currency: demand.currency as IFormValues['currency'],
                startDate: moment.unix(demand.startTime),
                endDate: moment.unix(demand.endTime),
                demandNeedsInDisplayUnit: EnergyFormatter.getValueInDisplayUnit(
                    demand.energyPerTimeFrame
                ).toString(),
                maxPricePerMWh: Math.round(demand.maxPriceInCentsPerMwh / 100).toString(),
                procureFromSingleFacility: demand.procureFromSingleFacility,
                timeframe: demand.timeFrame,
                automaticMatching: demand.automaticMatching
            };

            setInitialFormValuesFromDemand(newInitialFormValuesFromDemand);

            if (demand.vintage && demand.vintage.length === 2) {
                setVintage(demand.vintage);
            }

            if (demand.deviceType && demand.deviceType.length > 0) {
                setSelectedDeviceType(demand.deviceType);
            }

            if (demand.location && demand.location.length > 0) {
                setSelectedLocation(
                    demand.location.map(location => location.replace(`${country};`, ''))
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
        demandNeedsInDisplayUnit: IFormValues['demandNeedsInDisplayUnit'],
        timeframe: IFormValues['timeframe']
    ) {
        if (!endDate || !demandNeedsInDisplayUnit || !startDate || timeframe === '') {
            return 0;
        }

        return Demand.calculateTotalEnergyDemand(
            startDate.unix(),
            endDate.unix(),
            EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                parseFloat(demandNeedsInDisplayUnit)
            ),
            timeframe
        );
    }

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

        const offChainProps: DemandPostData = {
            owner: currentUser.id,
            currency: values.currency,
            startTime: values.startDate.unix(),
            endTime: values.endDate.unix(),
            timeFrame: values.timeframe,
            maxPriceInCentsPerMwh: parseFloat(values.maxPricePerMWh) * 100,
            energyPerTimeFrame: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                parseFloat(values.demandNeedsInDisplayUnit)
            ),
            automaticMatching: values.automaticMatching
        };

        if (values.procureFromSingleFacility) {
            offChainProps.procureFromSingleFacility = values.procureFromSingleFacility;
        }

        if (selectedDeviceType && selectedDeviceType.length > 0) {
            offChainProps.deviceType = selectedDeviceType;
        }

        if (selectedLocation && selectedLocation.length > 0) {
            offChainProps.location = selectedLocation.map(location => `${country};${location}`);
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
                await demand.update(offChainProps as DemandUpdateData);

                showNotification('Demand edited', NotificationType.Success);
            } else {
                const createdDemand = await Demand.createDemand(
                    offChainProps as DemandPostData,
                    configuration
                );

                showNotification('Demand created', NotificationType.Success);

                history.push(getDemandViewLink(createdDemand.id.toString()));
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

    if (!initialFormValues || !regions || !configuration) {
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
                    demandNeedsInDisplayUnit: Yup.number()
                        .label(`Demand needs (${EnergyFormatter.displayUnit})`)
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
                                        {...dataTest('demandNeedsInDisplayUnit')}
                                    >
                                        <Field
                                            label={`Demand needs (${EnergyFormatter.displayUnit})`}
                                            name="demandNeedsInDisplayUnit"
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
                                            {currencies?.map(option => (
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
                                        name="endDate"
                                        label="Active until date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={disabled}
                                        {...dataTest('endDate')}
                                    />
                                    <Field
                                        name="automaticMatching"
                                        Label={{
                                            label: 'Automatically buy certificates',
                                            className: 'mt-3'
                                        }}
                                        color="primary"
                                        component={CheckboxWithLabel}
                                        disabled={disabled}
                                        {...dataTest('automaticMatching')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        Producing Device Criteria
                                    </Typography>
                                    <HierarchicalMultiSelect
                                        selectedValue={selectedDeviceType}
                                        onChange={(value: string[]) => setSelectedDeviceType(value)}
                                        allValues={configuration.deviceTypeService?.deviceTypes}
                                        selectOptions={[
                                            {
                                                label: 'Device type',
                                                placeholder: 'Select device type'
                                            },
                                            {
                                                label: 'Device type',
                                                placeholder: 'Select device type'
                                            },
                                            {
                                                label: 'Device type',
                                                placeholder: 'Select device type'
                                            }
                                        ]}
                                        readOnly={readOnly}
                                        disabled={disabled}
                                    />
                                    <div className="Filter_menu_item_sliderWrapper mt-3">
                                        <InputLabel shrink={true}>
                                            Vintage (year of device construction)
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

                                    <div className="mt-3">
                                        Total demand:{' '}
                                        <b {...dataTest('totalDemand')}>
                                            {EnergyFormatter.format(
                                                totalDemand(
                                                    values.startDate,
                                                    values.endDate,
                                                    values.demandNeedsInDisplayUnit,
                                                    values.timeframe
                                                ),
                                                true
                                            )}
                                        </b>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        Producing Device Location
                                    </Typography>
                                    <HierarchicalMultiSelect
                                        selectedValue={selectedLocation}
                                        onChange={(value: string[]) => setSelectedLocation(value)}
                                        options={regions}
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
