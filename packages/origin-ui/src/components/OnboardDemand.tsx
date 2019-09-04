import * as React from 'react';
import { User, Role } from '@energyweb/user-registry';
import { Currency } from '@energyweb/utils-general';
import { showNotification, NotificationType } from '../utils/notifications';
import { Paper, Typography, FormControl, InputLabel, FilledInput, MenuItem, Grid, Button, Tooltip } from '@material-ui/core';
import { getEnumValues } from '../utils/Helper';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getCurrentUser } from '../features/selectors';
import './OnboardDemand.scss';
import { DatePicker } from '@material-ui/pickers';
import { MultiSelectAutocomplete, IAutocompleteMultiSelectOptionType } from './MultiSelectAutocomplete';
import { CustomSlider, CustomSliderThumbComponent } from './CustomSlider';
import moment, { Moment } from 'moment';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { Select, TextField, CheckboxWithLabel } from 'formik-material-ui';

const REGIONS_PROVINCES_MAP = {
    Northeast: [
        'Amnat Charoen',
        'Bueng Kan, Buri Ram',
        'Chaiyaphum, Kalasin',
        'Khon Kaen, Loei',
        'Maha Sarakham',
        'Mukdahan',
        'Nakhon Phanom',
        'Nakhon Ratchasima',
        'Nong Bua Lamphu',
        'Nong Khai',
        'Roi Et',
        'Sakon Nakhon',
        'Si Sa Ket',
        'Surin',
        'Ubon Ratchathani',
        'Udon Thani',
        'Yasothon'
    ],
    North: [
        'Chiang Mai',
        'Chiang Rai',
        'Lampang',
        'Lamphun',
        'Mae Hong Son',
        'Nan',
        'Phayao',
        'Phrae',
        'Uttaradit'
    ],
    West: [
        'Tak',
        'Kanchanaburi',
        'Ratchaburi',
        'Phetchaburi',
        'Prachuap Khiri Khan'
    ],
    Central: [
        'Sukhothai',
        'Phitsanulok',
        'Phichit',
        'Kamphaeng Phet',
        'Phetchabun',
        'Nakhon Sawan',
        'Uthai Thani',
        'Ang Thong',
        'Phra Nakhon Si Ayutthaya',
        'Bangkok, Chai Nat',
        'Lop Buri',
        'Nakhon Pathom',
        'Nonthaburi',
        'Pathum Thani',
        'Samut Prakan',
        'Samut Sakhon',
        'Samut Songkhram',
        'Saraburi',
        'Sing Buri',
        'Suphan Buri',
        'Nakhon Nayok'
    ],
    East: [
        'Chachoengsao',
        'Chanthaburi',
        'Chon Buri',
        'Prachin Buri',
        'Rayong',
        'Sa Kaeo',
        'Trat'
    ],
    South: [
        'Chumphon',
        'Nakhon Si Thammarat',
        'Narathiwat',
        'Pattani',
        'Phatthalung',
        'Songkhla',
        'Surat Thani',
        'Yala',
        'Krabi',
        'Phang Nga',
        'Phuket',
        'Ranong',
        'Satun',
        'Trang'
    ]
};

const TYPES = [
    {
        type: 'Solar',
        nested: [
            // 'Unspecified',
            {
                type: 'Photovoltaic',
                nested: [
                    // 'Unspecified',
                    'Roof mounted',
                    'Ground mounted'
                ]
            },
            {
                type: 'Concentration',
                nested: [
                    //     'Unspecified'
                ]
            }
        ]
    },
    {
        type: 'Wind',
        nested: [
            'Onshore',
            'Offshore'
        ]
    },
    {
        type: 'Hydro-electric Head',
        nested: [
            // 'Unspecified',
            {
                type: 'Run-of-river head installation',
                nested: [
                    //     'Unspecified'
                ]
            },
            {
                type: 'Storage head installation',
                nested: [
                    //     'Unspecified'
                ]
            },
            {
                type: 'Pure pumped storage head installation',
                nested: [
                    //     'Unspecified'
                ]
            },
            {
                type: 'Mixed pumped storage head',
                nested: [
                    //     'Unspecified'
                ]
            }
        ]
    },
    {
        type: 'Marine',
        nested: [
            {
                type: 'Tidal',
                nested: [
                    'Inshore',
                    'Offshore'
                ]
            },
            {
                type: 'Wave',
                nested: [
                    'Onshore',
                    'Offshore'
                ]
            },
            'Currents',
            'Pressure',
            'Thermal'
        ]
    },
    {
        type: 'Solid',
        nested: [
            {
                type: 'Muncipal waste',
                nested: [
                    'Biogenic'
                ]
            },
            {
                type: 'Industrial and commercial waste',
                nested: [
                    'Biogenic'
                ]
            },
            {
                type: 'Wood',
                nested: [
                    'Forestry products',
                    'Forestry by-products & waste'
                ]
            },
            'Animal fats',
            {
                type: 'Biomass from agriculture',
                nested: [
                    'Agricultural products',
                    'Agricultural by-products & waste'
                ]
            },
        ]
    },
    {
        type: 'Liquid',
        nested: [
            'Municipal biodegradable waste',
            'Black liquor',
            'Pure plant oil',
            'Waste plant oil',
            {
                type: 'Refined vegetable oil',
                nested: [
                    'Biodiesel (mono-alkyl ester)',
                    'Biogasoline (C6-C12 hydrocarbon)'
                ]
            }
        ]
    },
    {
        type: 'Gaseous',
        nested: [
            'Landfill gas',
            'Sewage gas',
            {
                type: 'Agricultural gas',
                nested: [
                    'Animal manure',
                    'Energy crops'
                ]
            },
            'Gas from organic waste digestion',
            {
                type: 'Process gas',
                nested: [
                    'Biogenic'
                ]
            }
        ]
    }
];

enum Timeframe {
    day,
    week,
    month,
    year
}

const REPEATABLE_TIMEFRAMES = [
    {
        label: 'Day',
        value: Timeframe.day
    },
    {
        label: 'Week',
        value: Timeframe.week
    },
    {
        label: 'Month',
        value: Timeframe.month
    },
    {
        label: 'Year',
        value: Timeframe.year
    }
]

const Level1Types = TYPES.map(type => ({
    value: typeof (type) === 'string' ? type : type.type,
    label: typeof (type) === 'string' ? type : type.type
}));

const regionOptions = Object.keys(REGIONS_PROVINCES_MAP).map(label => ({
    value: label,
    label
}));

interface IStateProps {
    configuration: Configuration.Entity;
    currentUser: User.Entity;
    producingAssets: ProducingAsset.Entity[];
}

interface IState {
    selectedRegions: IAutocompleteMultiSelectOptionType[];
    selectedProvinces: IAutocompleteMultiSelectOptionType[];
    selectedTypesLevelOne: IAutocompleteMultiSelectOptionType[];
    selectedTypesLevelTwo: IAutocompleteMultiSelectOptionType[];
    selectedTypesLevelThree: IAutocompleteMultiSelectOptionType[];
    vintage: number[];
}

const DEFAULT_VINTAGE_RANGE = [1970, moment().year()];

const FormikDatePicker = ({
    form: { setFieldValue },
    field: { name, value },
    ...rest
}) => <DatePicker
        onChange={(value) => setFieldValue(name, value)}
        value={value}
        {...rest}
    />

class OnboardDemandClass extends React.Component<IStateProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            selectedRegions: [],
            selectedProvinces: [],
            selectedTypesLevelOne: [],
            selectedTypesLevelTwo: [],
            selectedTypesLevelThree: [],
            vintage: null
        };
    }

    totalDemand(startDate: Moment, endDate: Moment, demandNeedsInMWh: string, timeframe: number) {
        if (!endDate || !demandNeedsInMWh || !startDate || typeof (timeframe) === 'undefined') {
            return 0;
        }

        const demandAsFloat = parseFloat(demandNeedsInMWh);

        let numberOfTimesDemandWillRepeat = 0;

        const demandDuration = moment.duration(endDate.diff(startDate));

        switch (timeframe) {
            case Timeframe.day:
                numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asDays());
                break;
            case Timeframe.week:
                numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asWeeks());
                break;
            case Timeframe.month:
                numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asMonths());
                break;
            case Timeframe.year:
                numberOfTimesDemandWillRepeat = Math.ceil(demandDuration.asYears());
                break;
        }

        return demandAsFloat * numberOfTimesDemandWillRepeat;
    }

    get currencies() {
        return getEnumValues(Currency).filter(curr => Currency[curr] !== Currency.NONE);
    }

    get provincesOptions() {
        const {
            selectedRegions
        } = this.state;

        if (!selectedRegions) {
            return [];
        }

        return selectedRegions.reduce(
            (a: string[], b: IAutocompleteMultiSelectOptionType) => a.concat(REGIONS_PROVINCES_MAP[b.label]), []
        ).map(item => ({
            label: item,
            value: item
        }));
    }

    get assetTypesOptions() {
        const {
            selectedTypesLevelOne,
            selectedTypesLevelTwo
        } = this.state;

        const levelTwoTypes = [];
        const levelThreeTypes = [];

        for (const levelOneType of TYPES) {
            const levelOneTypeSelected = (selectedTypesLevelOne ? selectedTypesLevelOne : []).find(type => type.value === levelOneType.type);

            if (!levelOneTypeSelected) {
                continue;
            }

            levelTwoTypes.push(...levelOneType.nested.map(levelTwoType => ({
                value: typeof (levelTwoType) === 'string' ? levelTwoType : levelTwoType.type,
                label: `${levelOneType.type} - ${typeof (levelTwoType) === 'string' ? levelTwoType : levelTwoType.type}`
            })));

            for (const levelTwoType of levelOneType.nested) {
                const levelTwoTypeSelected = (selectedTypesLevelTwo ? selectedTypesLevelTwo : []).find(type => type.value === (typeof (levelTwoType) === 'string' ? levelTwoType : levelTwoType.type));

                if (!levelTwoTypeSelected || typeof (levelTwoType) === 'string') {
                    continue;
                }

                levelThreeTypes.push(...levelTwoType.nested.map(type => ({
                    value: type,
                    label: `${levelOneType.type} - ${levelTwoType.type} - ${type}`
                })));
            }

            levelOneType.nested.map(levelTwoType => typeof (levelTwoType) === 'string' ? '' : levelTwoType.nested)
        }

        return { levelTwoTypes, levelThreeTypes };
    }

    isUserTraderRole() {
        return this.props.currentUser && this.props.currentUser.isRole(Role.Trader);
    }

    isFormValid() {
        return this.isUserTraderRole();
    }

    render() {
        const {
            selectedRegions,
            selectedProvinces,
            selectedTypesLevelOne,
            selectedTypesLevelTwo,
            selectedTypesLevelThree,
            vintage
        } = this.state;

        const { currencies, provincesOptions, assetTypesOptions: { levelTwoTypes, levelThreeTypes } } = this;

        const minDate = moment().hour(0).minutes(0).seconds(0);

        return (
            <Paper className="OnboardDemand">
                <Formik
                    initialValues={{
                        demandNeedsInMWh: '',
                        maxPricePerMWh: '',
                        currency: '',
                        timeframe: '' as any as number,
                        activeUntilDate: null,
                        startDate: null,
                        endDate: null,
                        procureFromSingleFacility: false
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log('submit values', values)

                        setSubmitting(true);

                        setTimeout(() => {
                            setSubmitting(false);

                            showNotification('Demand created', NotificationType.Success);
                        }, 4000);
                    }}

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
                        startDate: Yup.date()
                            .required(),
                        endDate: Yup.date()
                            .required(),
                        activeUntilDate: Yup.date()
                            .required(),
                        procureFromSingleFacility: Yup.boolean()
                    })}
                >
                    {(props) => {
                        const {
                            values,
                            isValid,
                            isSubmitting
                        } = props;

                        let buttonTooltip = '';

                        if (isSubmitting) {
                            buttonTooltip = 'Form is submitting. Please wait.';
                        } else if (!isValid) {
                            buttonTooltip = `Form needs to be valid to proceed.`;
                        } else if (!this.isUserTraderRole()) {
                            buttonTooltip = 'You need to have a Trader role to create a demand.';
                        }

                        return <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">General</Typography>
                                    <FormControl fullWidth variant="filled" className="mt-3" required>
                                        <Field
                                            label="Demand needs (MWh)"
                                            name="demandNeedsInMWh"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                        />
                                    </FormControl>
                                    <FormControl fullWidth variant="filled" className="mt-3" required>
                                        <Field
                                            label="Max price (per MWh)"
                                            name="maxPricePerMWh"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                        />
                                    </FormControl>
                                    <FormControl fullWidth variant="filled" className="mt-3" required>
                                        <InputLabel required>Currency</InputLabel>
                                        <Field
                                            name="currency"
                                            label="Currency"
                                            component={Select}
                                            input={<FilledInput value={values.currency} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                        >
                                            {currencies.map((option) => <MenuItem value={option} key={option}>{option}</MenuItem>)}
                                        </Field>
                                    </FormControl>
                                    <Field
                                        name="startDate"
                                        label="Start date"
                                        minDate={minDate}
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                    />
                                    <Field
                                        name="activeUntilDate"
                                        label="Active until date"
                                        minDate={minDate}
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Producing Asset Criteria</Typography>
                                    <MultiSelectAutocomplete
                                        label="Asset type"
                                        placeholder="Select asset type"
                                        options={Level1Types}
                                        onChange={(value) => this.setState({
                                            selectedTypesLevelOne: value
                                        })}
                                        selectedValues={selectedTypesLevelOne}
                                        classes={{ root: 'mt-3' }}
                                        disabled={isSubmitting}
                                    />
                                    {levelTwoTypes.length > 0 && (
                                        <MultiSelectAutocomplete
                                            label="Asset type"
                                            placeholder="Select asset type"
                                            options={levelTwoTypes}
                                            onChange={(value) => this.setState({
                                                selectedTypesLevelTwo: value
                                            })}
                                            selectedValues={selectedTypesLevelTwo}
                                            classes={{ root: 'mt-3' }}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                    {levelThreeTypes.length > 0 && (
                                        <MultiSelectAutocomplete
                                            label="Asset type"
                                            placeholder="Select asset type"
                                            options={levelThreeTypes}
                                            onChange={(value) => this.setState({
                                                selectedTypesLevelThree: value
                                            })}
                                            selectedValues={selectedTypesLevelThree}
                                            classes={{ root: 'mt-3' }}
                                            disabled={isSubmitting}
                                        />
                                    )}

                                    <div className="Filter_menu_item_sliderWrapper mt-3">
                                        <InputLabel shrink={true}>Vintage (year of asset construction)</InputLabel>
                                        <CustomSlider
                                            valueLabelDisplay="on"
                                            defaultValue={
                                                vintage || DEFAULT_VINTAGE_RANGE
                                            }
                                            min={DEFAULT_VINTAGE_RANGE[0]}
                                            max={DEFAULT_VINTAGE_RANGE[1]}
                                            ThumbComponent={CustomSliderThumbComponent}
                                            onChangeCommitted={(event, value: number[]) =>
                                                this.setState({
                                                    vintage: value
                                                })
                                            }
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <Field
                                        name="procureFromSingleFacility"
                                        Label={{
                                            label: "Procure from single facility"
                                        }}
                                        color="primary"
                                        component={CheckboxWithLabel}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Repeatable</Typography>
                                    <FormControl fullWidth variant="filled" className="mt-3" required>
                                        <InputLabel required>Every</InputLabel>
                                        <Field
                                            name="timeframe"
                                            label="Timeframe"
                                            component={Select}
                                            input={<FilledInput value={values.timeframe} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                        >
                                            {REPEATABLE_TIMEFRAMES.map(timeframe =>
                                                <MenuItem value={timeframe.value} key={timeframe.value}>{timeframe.label}</MenuItem>
                                            )}
                                        </Field>
                                    </FormControl> 

                                    <Field
                                        name="endDate"
                                        label="End date"
                                        minDate={minDate}
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                    />
                                    
                                    <div className="mt-3">
                                        Total demand: <b>{this.totalDemand(
                                            values.startDate,
                                            values.endDate,
                                            values.demandNeedsInMWh,
                                            values.timeframe
                                        )} MWh</b>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Producing Asset Location</Typography>
                                    <MultiSelectAutocomplete
                                        label="Regions"
                                        placeholder="Select multiple regions"
                                        options={regionOptions}
                                        onChange={(value) => this.setState({
                                            selectedRegions: value
                                        })}
                                        selectedValues={selectedRegions}
                                        classes={{ root: 'mt-3' }}
                                        disabled={isSubmitting}
                                    />
                                    <MultiSelectAutocomplete
                                        label="Provinces"
                                        placeholder="Select multiple provinces"
                                        options={provincesOptions}
                                        onChange={(value) => this.setState({
                                            selectedProvinces: value
                                        })}
                                        selectedValues={selectedProvinces}
                                        classes={{ root: 'mt-3' }}
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                            </Grid>

                            <Tooltip title={buttonTooltip} disableHoverListener={!buttonTooltip}>
                                <span>
                                    <Button type="submit" variant="contained" color="primary" className="mt-3 right" disabled={isSubmitting || !isValid || !this.isUserTraderRole()}>
                                        Create demand
                            </Button>
                                </span>
                            </Tooltip>
                        </Form>
                    }}
                </Formik>
            </Paper>
        );
    }
}

export const OnboardDemand = connect(
    (state: IStoreState): IStateProps => ({
        currentUser: getCurrentUser(state)
    })
)(OnboardDemandClass);
