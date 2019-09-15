import * as React from 'react';
import { User, Role } from '@energyweb/user-registry';
import {
    Currency,
    Configuration,
    TimeFrame,
    THAILAND_REGIONS_PROVINCES_MAP,
    EncodedAssetType
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
import { getEnumValues } from '../../utils/Helper';
import { connect } from 'react-redux';
import { IStoreState } from '../../types';
import { getCurrentUser, getConfiguration, getBaseURL } from '../../features/selectors';
import './DemandForm.scss';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from '../MultiSelectAutocomplete';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';
import moment, { Moment } from 'moment';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { Select, TextField, CheckboxWithLabel } from 'formik-material-ui';
import { Demand } from '@energyweb/market';
import { LoadingComponent } from '../LoadingComponent';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getDemandViewLink } from '../../utils/routing';
import { FormikDatePicker } from '../FormikDatePicker';
import { AssetTypeSelector } from '../AssetTypeSelector';

export function calculateTotalEnergyDemand(
    startDate: Moment,
    endDate: Moment,
    targetWhPerPeriod: number,
    timeframe: TimeFrame
) {
    let numberOfTimesDemandWillRepeat = 0;

    const demandDuration = moment.duration(endDate.diff(startDate));

    switch (timeframe) {
        case TimeFrame.daily:
            numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asDays());
            break;
        case TimeFrame.weekly:
            numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asWeeks());
            break;
        case TimeFrame.monthly:
            numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asMonths());
            break;
        case TimeFrame.yearly:
            numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asYears());
            break;
    }

    return targetWhPerPeriod * numberOfTimesDemandWillRepeat;
}

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

const regionOptions = Object.keys(THAILAND_REGIONS_PROVINCES_MAP).map(label => ({
    value: label,
    label
}));

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

interface IOwnProps {
    demand?: Demand.Entity;
    edit?: boolean;
    clone?: boolean;
    readOnly?: boolean;
}

interface IStateProps {
    baseURL: string;
    currentUser: User.Entity;
    configuration: Configuration.Entity;
}

type Props = RouteComponentProps & IOwnProps & IStateProps;

interface IState {
    selectedRegions: IAutocompleteMultiSelectOptionType[];
    selectedProvinces: IAutocompleteMultiSelectOptionType[];
    selectedAssetType: EncodedAssetType;
    vintage: [number, number];
    initialFormValuesFromDemand: IFormValues;
}

const DEFAULT_VINTAGE_RANGE: [number, number] = [1970, moment().year()];

class DemandFormClass extends React.Component<Props, IState> {
    constructor(props) {
        super(props);

        this.state = {
            selectedRegions: [],
            selectedProvinces: [],
            selectedAssetType: [],
            initialFormValuesFromDemand: null,
            vintage: null
        };

        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {
        this.updateComponent(this.props);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.demand !== prevProps.demand) {
            this.updateComponent(this.props);
        }
    }

    updateComponent(props: Props) {
        if (!props.demand) {
            return;
        }

        this.setupFormBasedOnDemand(props.demand);
    }

    setupFormBasedOnDemand(demand: Demand.Entity) {
        const initialFormValuesFromDemand: IFormValues = {
            currency: Currency[demand.offChainProperties.currency] as IFormValues['currency'],
            startDate: moment.unix(parseInt(demand.offChainProperties.startTime, 10)),
            endDate: moment.unix(parseInt(demand.offChainProperties.endTime, 10)),
            activeUntilDate: moment.unix(parseInt(demand.offChainProperties.endTime, 10)),
            demandNeedsInMWh: Math.round(
                demand.offChainProperties.targetWhPerPeriod / 1000000
            ).toString(),
            maxPricePerMWh: Math.round(demand.offChainProperties.maxPricePerMwh / 100).toString(),
            procureFromSingleFacility: demand.offChainProperties.procureFromSingleFacility,
            timeframe: demand.offChainProperties.timeFrame
        };

        const newState: Partial<IState> = {
            initialFormValuesFromDemand
        };

        if (demand.offChainProperties.vintage && demand.offChainProperties.vintage.length === 2) {
            newState.vintage = demand.offChainProperties.vintage;
        }

        if (demand.offChainProperties.location) {
            if (
                demand.offChainProperties.location.regions &&
                demand.offChainProperties.location.regions.length > 0
            ) {
                newState.selectedRegions = demand.offChainProperties.location.regions.map(
                    (region): IAutocompleteMultiSelectOptionType => ({
                        label: region,
                        value: region
                    })
                );
            }

            if (
                demand.offChainProperties.location.provinces &&
                demand.offChainProperties.location.provinces.length > 0
            ) {
                newState.selectedProvinces = demand.offChainProperties.location.provinces.map(
                    (province): IAutocompleteMultiSelectOptionType => ({
                        label: province,
                        value: province
                    })
                );
            }
        }

        if (demand.offChainProperties.assetType && demand.offChainProperties.assetType.length > 0) {
            newState.selectedAssetType = demand.offChainProperties.assetType;
        }

        this.setState(newState as IState);
    }

    totalDemand(
        startDate: IFormValues['startDate'],
        endDate: IFormValues['endDate'],
        demandNeedsInMWh: IFormValues['demandNeedsInMWh'],
        timeframe: IFormValues['timeframe']
    ) {
        if (!endDate || !demandNeedsInMWh || !startDate || timeframe === '') {
            return 0;
        }

        return calculateTotalEnergyDemand(
            startDate,
            endDate,
            parseInt(demandNeedsInMWh, 10) * 1000000,
            timeframe
        );
    }

    get currencies() {
        return getEnumValues(Currency).filter(curr => Currency[curr] !== Currency.NONE);
    }

    get provincesOptions() {
        const { selectedRegions } = this.state;

        if (!selectedRegions) {
            return [];
        }

        return selectedRegions
            .reduce(
                (a: string[], b: IAutocompleteMultiSelectOptionType) =>
                    a.concat(THAILAND_REGIONS_PROVINCES_MAP[b.label]),
                []
            )
            .map(item => ({
                label: item,
                value: item
            }));
    }

    isUserTraderRole() {
        return this.props.currentUser && this.props.currentUser.isRole(Role.Trader);
    }

    async submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (values.timeframe === '' || values.currency === '') {
            return;
        }

        const { selectedRegions, selectedProvinces, selectedAssetType, vintage } = this.state;

        const { baseURL, currentUser, configuration, edit, demand, history } = this.props;

        formikActions.setSubmitting(true);

        configuration.blockchainProperties.activeUser = {
            address: currentUser.id
        };

        const offChainProps: Demand.IDemandOffChainProperties = {
            currency: Currency[values.currency as keyof typeof Currency],
            startTime: values.startDate.unix().toString(),
            endTime: values.endDate.unix().toString(),
            timeFrame: values.timeframe,
            maxPricePerMwh: Math.round(parseFloat(values.maxPricePerMWh) * 100),
            targetWhPerPeriod: Math.round(parseFloat(values.demandNeedsInMWh) * 1000000)
        };

        if (values.procureFromSingleFacility) {
            offChainProps.procureFromSingleFacility = values.procureFromSingleFacility;
        }

        if (selectedAssetType && selectedAssetType.length > 0) {
            offChainProps.assetType = selectedAssetType;
        }

        if (selectedRegions && selectedRegions.length > 0) {
            offChainProps.location = {
                regions: selectedRegions.map(i => i.value)
            };
        }

        if (selectedProvinces && selectedProvinces.length > 0) {
            if (typeof offChainProps.location === 'undefined') {
                offChainProps.location = {
                    provinces: selectedProvinces.map(i => i.value)
                };
            } else {
                offChainProps.location.provinces = selectedProvinces.map(i => i.value);
            }
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

                history.push(getDemandViewLink(baseURL, createdDemand.id));
            }
        } catch (error) {
            console.error('Demand form error', error);
            showNotification(`Can't save demand`, NotificationType.Error);
        }

        formikActions.setSubmitting(false);
    }

    render() {
        const {
            selectedRegions,
            selectedProvinces,
            selectedAssetType,
            vintage,
            initialFormValuesFromDemand
        } = this.state;

        const { edit, clone, readOnly } = this.props;

        const { currencies, provincesOptions } = this;

        let initialFormValues = null;

        if (edit || clone || readOnly) {
            initialFormValues = initialFormValuesFromDemand;
        } else {
            initialFormValues = INITIAL_FORM_VALUES;
        }

        if (!initialFormValues) {
            return <LoadingComponent />;
        }

        let submitButtonText;

        if (edit) {
            submitButtonText = 'Save demand';
        } else if (!readOnly) {
            submitButtonText = 'Create demand';
        }

        return (
            <Paper className="DemandForm">
                <Formik
                    initialValues={initialFormValues}
                    onSubmit={this.submitForm}
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
                    {props => {
                        const { values, isValid, isSubmitting } = props;

                        const disabled = isSubmitting || readOnly;

                        let buttonTooltip = '';

                        if (isSubmitting) {
                            buttonTooltip = 'Form is submitting. Please wait.';
                        } else if (!isValid) {
                            buttonTooltip = `Form needs to be valid to proceed.`;
                        } else if (!this.isUserTraderRole()) {
                            buttonTooltip = 'You need to have a Trader role to create a demand.';
                        }

                        return (
                            <Form>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Typography className="mt-3">General</Typography>
                                        <FormControl
                                            fullWidth
                                            variant="filled"
                                            className="mt-3"
                                            required
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
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography className="mt-3">
                                            Producing Asset Criteria
                                        </Typography>
                                        <AssetTypeSelector
                                            selectedType={selectedAssetType}
                                            onChange={(value: EncodedAssetType) =>
                                                this.setState({
                                                    selectedAssetType: value
                                                })
                                            }
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
                                                onChangeCommitted={(
                                                    event,
                                                    value: [number, number]
                                                ) =>
                                                    this.setState({
                                                        vintage: value
                                                    })
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
                                        />

                                        <div className="mt-3">
                                            Total demand:{' '}
                                            <b>
                                                {(
                                                    this.totalDemand(
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
                                        <MultiSelectAutocomplete
                                            label="Regions"
                                            placeholder={readOnly ? '' : 'Select multiple regions'}
                                            options={regionOptions}
                                            onChange={value =>
                                                this.setState({
                                                    selectedRegions: value
                                                })
                                            }
                                            selectedValues={selectedRegions}
                                            classes={{ root: 'mt-3' }}
                                            disabled={disabled}
                                        />
                                        <MultiSelectAutocomplete
                                            label="Provinces"
                                            placeholder={
                                                readOnly ? '' : 'Select multiple provinces'
                                            }
                                            options={provincesOptions}
                                            onChange={value =>
                                                this.setState({
                                                    selectedProvinces: value
                                                })
                                            }
                                            selectedValues={selectedProvinces}
                                            classes={{ root: 'mt-3' }}
                                            disabled={disabled}
                                        />
                                    </Grid>
                                </Grid>

                                {submitButtonText && (
                                    <Tooltip
                                        title={buttonTooltip}
                                        disableHoverListener={!buttonTooltip}
                                    >
                                        <span>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                className="mt-3 right"
                                                disabled={
                                                    disabled || !isValid || !this.isUserTraderRole()
                                                }
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
}

export const DemandForm = withRouter(
    connect(
        (state: IStoreState): IStateProps => ({
            baseURL: getBaseURL(state),
            currentUser: getCurrentUser(state),
            configuration: getConfiguration(state)
        })
    )(DemandFormClass)
);
