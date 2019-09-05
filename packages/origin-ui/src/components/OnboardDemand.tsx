import * as React from 'react';
import { User, Role } from '@energyweb/user-registry';
import { Currency, IRECAssetService } from '@energyweb/utils-general';
import { showNotification, NotificationType } from '../utils/notifications';
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
import { getEnumValues } from '../utils/Helper';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getCurrentUser } from '../features/selectors';
import './OnboardDemand.scss';
import { DatePicker } from '@material-ui/pickers';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from './MultiSelectAutocomplete';
import { CustomSlider, CustomSliderThumbComponent } from './CustomSlider';
import moment, { Moment } from 'moment';
import { Formik, Field, Form, FieldProps } from 'formik';
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
    West: ['Tak', 'Kanchanaburi', 'Ratchaburi', 'Phetchaburi', 'Prachuap Khiri Khan'],
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
    East: ['Chachoengsao', 'Chanthaburi', 'Chon Buri', 'Prachin Buri', 'Rayong', 'Sa Kaeo', 'Trat'],
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

const irecAssetService = new IRECAssetService();
const TYPES = irecAssetService.AssetTypes;

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
];

const Level1Types = TYPES.filter(assetType => assetType.length === 1).map(type => ({
    value: type[0],
    label: type[0]
}));

const regionOptions = Object.keys(REGIONS_PROVINCES_MAP).map(label => ({
    value: label,
    label
}));

interface IStateProps {
    currentUser: User.Entity;
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
}: FieldProps) => (
    <DatePicker onChange={newValue => setFieldValue(name, newValue)} value={value} {...rest} />
);

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
        if (!endDate || !demandNeedsInMWh || !startDate || typeof timeframe === 'undefined') {
            return 0;
        }

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

        return Number(demandNeedsInMWh) * numberOfTimesDemandWillRepeat;
    }

    typesByLevel(level: number) {
        return TYPES.filter(t => t.length === level).map(t => irecAssetService.encode([t]).pop());
    }

    filterSelected(currentType: string, types: string[], selected) {
        const isSelected = (selected || []).find(type => type.value === currentType);

        if (!isSelected) {
            return [];
        }

        return types.filter(t => t.startsWith(currentType));
    }

    assetTypesToSelectionOptions(types: string[]) {
        return types.map(t => ({
            value: t,
            label: irecAssetService
                .decode([t])
                .pop()
                .join(' - ')
        }));
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
                    a.concat(REGIONS_PROVINCES_MAP[b.label]),
                []
            )
            .map(item => ({
                label: item,
                value: item
            }));
    }

    get assetTypesOptions() {
        const { selectedTypesLevelOne, selectedTypesLevelTwo } = this.state;

        const levelTwoTypes = [];
        const levelThreeTypes = [];

        const availableL1Types = this.typesByLevel(1);
        const availableL2Types = this.typesByLevel(2);
        const availableL3Types = this.typesByLevel(3);

        for (const currentType of availableL1Types) {
            const level2Types = this.filterSelected(
                currentType,
                availableL2Types,
                selectedTypesLevelOne
            );

            if (!level2Types.length) {
                continue;
            }

            levelTwoTypes.push(...this.assetTypesToSelectionOptions(level2Types));

            for (const currentLevel2Type of level2Types) {
                const level3Types = this.filterSelected(
                    currentLevel2Type,
                    availableL3Types,
                    selectedTypesLevelTwo
                );

                if (!level3Types.length) {
                    continue;
                }

                levelThreeTypes.push(...this.assetTypesToSelectionOptions(level3Types));
            }
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

        const {
            currencies,
            provincesOptions,
            assetTypesOptions: { levelTwoTypes, levelThreeTypes }
        } = this;

        const minDate = moment()
            .hour(0)
            .minutes(0)
            .seconds(0);

        return (
            <Paper className="OnboardDemand">
                <Formik
                    initialValues={{
                        demandNeedsInMWh: '',
                        maxPricePerMWh: '',
                        currency: '',
                        timeframe: ('' as any) as number,
                        activeUntilDate: null,
                        startDate: null,
                        endDate: null,
                        procureFromSingleFacility: false
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log('submit values', values);

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
                        startDate: Yup.date().required(),
                        endDate: Yup.date().required(),
                        activeUntilDate: Yup.date().required(),
                        procureFromSingleFacility: Yup.boolean()
                    })}
                >
                    {props => {
                        const { values, isValid, isSubmitting } = props;

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
                                        <Typography className="mt-3">
                                            Producing Asset Criteria
                                        </Typography>
                                        <MultiSelectAutocomplete
                                            label="Asset type"
                                            placeholder="Select asset type"
                                            options={Level1Types}
                                            onChange={value =>
                                                this.setState({
                                                    selectedTypesLevelOne: value
                                                })
                                            }
                                            selectedValues={selectedTypesLevelOne}
                                            classes={{ root: 'mt-3' }}
                                            disabled={isSubmitting}
                                        />
                                        {levelTwoTypes.length > 0 && (
                                            <MultiSelectAutocomplete
                                                label="Asset type"
                                                placeholder="Select asset type"
                                                options={levelTwoTypes}
                                                onChange={value =>
                                                    this.setState({
                                                        selectedTypesLevelTwo: value
                                                    })
                                                }
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
                                                onChange={value =>
                                                    this.setState({
                                                        selectedTypesLevelThree: value
                                                    })
                                                }
                                                selectedValues={selectedTypesLevelThree}
                                                classes={{ root: 'mt-3' }}
                                                disabled={isSubmitting}
                                            />
                                        )}

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
                                                label: 'Procure from single facility'
                                            }}
                                            color="primary"
                                            component={CheckboxWithLabel}
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
                                            minDate={minDate}
                                            className="mt-3"
                                            inputVariant="filled"
                                            variant="inline"
                                            fullWidth
                                            required
                                            component={FormikDatePicker}
                                        />

                                        <div className="mt-3">
                                            Total demand:{' '}
                                            <b>
                                                {this.totalDemand(
                                                    values.startDate,
                                                    values.endDate,
                                                    values.demandNeedsInMWh,
                                                    values.timeframe
                                                )}{' '}
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
                                            placeholder="Select multiple regions"
                                            options={regionOptions}
                                            onChange={value =>
                                                this.setState({
                                                    selectedRegions: value
                                                })
                                            }
                                            selectedValues={selectedRegions}
                                            classes={{ root: 'mt-3' }}
                                            disabled={isSubmitting}
                                        />
                                        <MultiSelectAutocomplete
                                            label="Provinces"
                                            placeholder="Select multiple provinces"
                                            options={provincesOptions}
                                            onChange={value =>
                                                this.setState({
                                                    selectedProvinces: value
                                                })
                                            }
                                            selectedValues={selectedProvinces}
                                            classes={{ root: 'mt-3' }}
                                            disabled={isSubmitting}
                                        />
                                    </Grid>
                                </Grid>

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
                                                isSubmitting || !isValid || !this.isUserTraderRole()
                                            }
                                        >
                                            Create demand
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Form>
                        );
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
