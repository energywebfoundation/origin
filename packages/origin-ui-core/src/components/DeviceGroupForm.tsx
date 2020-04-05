import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Formik, Field, Form, FormikHelpers, FieldArray } from 'formik';
import * as Yup from 'yup';
import { TextField } from 'formik-material-ui';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Paper,
    Typography,
    FormControl,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TextField as MaterialTextField,
    TableBody
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { Unit } from '@energyweb/utils-general';
import { DeviceStatus, IExternalDeviceId } from '@energyweb/origin-backend-core';

import { showNotification, NotificationType } from '../utils/notifications';
import { getConfiguration } from '../features/selectors';
import { getUserOffchain } from '../features/users/selectors';
import { setLoading } from '../features/general/actions';
import { getCompliance, getCountry, getExternalDeviceIdTypes } from '../features/general/selectors';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import { ProducingDevice } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../features/producingDevices/actions';
import { PowerFormatter, useLinks } from '../utils';
import { FormInput } from './Form/FormInput';

const MAX_TOTAL_CAPACITY = 5 * Unit.MW;

interface IDeviceGroupChild {
    installationName: string;
    address: string;
    city: string;
    latitude: number | '';
    longitude: number | '';
    capacity: number | '';
    meterId: string;
    meterType: string;
}

function getDefaultDeviceData(): IDeviceGroupChild {
    return {
        installationName: '',
        address: '',
        city: '',
        latitude: '',
        longitude: '',
        capacity: '',
        meterId: '',
        meterType: ''
    };
}

interface IFormValues {
    facilityName: string;
    children: IDeviceGroupChild[];
}

const INITIAL_FORM_VALUES: IFormValues = {
    facilityName: '',
    children: [getDefaultDeviceData()]
};

function sumCapacityOfDevices(devices: IDeviceGroupChild[]) {
    const totalCapacityInKW = devices.reduce((a, b) => {
        if (typeof b.capacity === 'number' && !isNaN(b.capacity)) {
            return a + b.capacity;
        }

        return a;
    }, 0);

    const totalCapacityInW =
        typeof totalCapacityInKW === 'number' && !isNaN(totalCapacityInKW)
            ? totalCapacityInKW * Unit.kW
            : 0;

    return totalCapacityInW;
}

const VALIDATION_SCHEMA = Yup.object().shape({
    facilityName: Yup.string().label('Facility name').required(),
    children: Yup.array()
        .of(
            Yup.object()
                .shape({
                    installationName: Yup.string().required('Installation name'),
                    address: Yup.string().required().label('Address'),
                    city: Yup.string().required().label('City'),
                    latitude: Yup.number().required().label('Latitude'),
                    longitude: Yup.number().required().label('Longitude'),
                    capacity: Yup.number().required().min(20).label('Capacity'),
                    meterId: Yup.string().required().label('Meter id'),
                    meterType: Yup.string()
                        .oneOf(['interval', 'scalar'])
                        .required()
                        .label('Meter type')
                })
                // eslint-disable-next-line no-template-curly-in-string
                .test('is-total-capacity-in-bounds', '${path} threshold invalid', function () {
                    const devices: IDeviceGroupChild[] = this.parent;
                    const totalCapacityInW = sumCapacityOfDevices(devices);

                    if (totalCapacityInW > MAX_TOTAL_CAPACITY) {
                        return this.createError({
                            path: `${this.path}.capacity`,
                            message: `Total capacity can be maximum: ${PowerFormatter.format(
                                MAX_TOTAL_CAPACITY,
                                true
                            )}`
                        });
                    }

                    return true;
                })
        )
        .min(1)
});

interface IProps {
    device?: ProducingDevice.Entity;
    readOnly?: boolean;
}

export function DeviceGroupForm(props: IProps) {
    const { device, readOnly } = props;

    const user = useSelector(getUserOffchain);
    const configuration = useSelector(getConfiguration);
    const compliance = useSelector(getCompliance);
    const country = useSelector(getCountry);
    const externalDeviceIdTypes = useSelector(getExternalDeviceIdTypes);

    const [initialFormValuesFromExistingEntity, setInitialFormValuesFromExistingEntity] = useState<
        IFormValues
    >(null);

    const dispatch = useDispatch();
    const { getDevicesOwnedLink } = useLinks();

    const selectedDeviceType = ['Solar', 'Solar;Photovoltaic'];

    const history = useHistory();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            },
            selectContainer: {
                paddingTop: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    useEffect(() => {
        if (!device) {
            return;
        }

        const newInitialFormValuesFromExistingEntity: IFormValues = {
            facilityName: device?.facilityName,
            children: JSON.parse(device?.deviceGroup)
        };

        setInitialFormValuesFromExistingEntity(newInitialFormValuesFromExistingEntity);
    }, [device]);

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (!user?.blockchainAccountAddress) {
            return;
        }

        const deviceType = 'Solar;Photovoltaic';

        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        const externalDeviceIds: IExternalDeviceId[] = externalDeviceIdTypes.map((type) => {
            const typeString = (type as unknown) as string;
            return {
                id: values[(type as unknown) as string],
                type: typeString
            };
        });

        const deviceProducingPropsOffChain = {
            status: DeviceStatus.Submitted,
            deviceType,
            complianceRegistry: compliance,
            facilityName: values.facilityName,
            capacityInW: sumCapacityOfDevices(values.children),
            country,
            address: '',
            region: '',
            province: '',
            gpsLatitude: values.children[0].latitude?.toString(),
            gpsLongitude: values.children[0].longitude?.toString(),
            timezone: 'Asia/Bangkok',
            operationalSince: moment().unix(),
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: '',
            images: JSON.stringify([]),
            deviceGroup: JSON.stringify(values.children),
            externalDeviceIds
        };

        try {
            const newDevice = await ProducingDevice.createDevice(
                deviceProducingPropsOffChain,
                configuration
            );

            dispatch(producingDeviceCreatedOrUpdated(newDevice));

            showNotification('Device successfully created.', NotificationType.Success);

            history.push(getDevicesOwnedLink());
        } catch (error) {
            throw new Error(error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    let initialFormValues: IFormValues = null;

    if (readOnly) {
        initialFormValues = initialFormValuesFromExistingEntity;
    } else {
        initialFormValues = INITIAL_FORM_VALUES;
    }

    if (!initialFormValues || !configuration) {
        return <Skeleton variant="rect" height={200} />;
    }

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values } = formikProps;

                    const fieldDisabled = isSubmitting || readOnly;
                    const buttonDisabled = isSubmitting || !isValid || readOnly;

                    return (
                        <Form translate="">
                            {!readOnly && (
                                <>
                                    <Grid container spacing={3}>
                                        <Grid item xs={6}>
                                            <Typography className="mt-3">General</Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={3}>
                                        <Grid item xs={6}>
                                            <FormControl
                                                fullWidth
                                                variant="filled"
                                                className="mt-3"
                                                required
                                            >
                                                <Field
                                                    label="Facility name"
                                                    name="facilityName"
                                                    component={TextField}
                                                    variant="filled"
                                                    fullWidth
                                                    required
                                                    disabled={fieldDisabled}
                                                />
                                            </FormControl>
                                            <div className={classes.selectContainer}>
                                                <HierarchicalMultiSelect
                                                    selectedValue={selectedDeviceType}
                                                    onChange={null}
                                                    allValues={
                                                        configuration.deviceTypeService.deviceTypes
                                                    }
                                                    selectOptions={[
                                                        {
                                                            label: 'Device type',
                                                            placeholder: 'Select device type'
                                                        },
                                                        {
                                                            label: 'Device type',
                                                            placeholder: 'Select device type'
                                                        }
                                                    ]}
                                                    disabled={true}
                                                    singleChoice={true}
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl
                                                fullWidth
                                                variant="filled"
                                                className="mt-3"
                                                required
                                            >
                                                <MaterialTextField
                                                    label={`Capacity (${PowerFormatter.displayUnit})`}
                                                    value={PowerFormatter.format(
                                                        sumCapacityOfDevices(values?.children)
                                                    )}
                                                    variant="filled"
                                                    fullWidth
                                                    disabled={true}
                                                />
                                            </FormControl>

                                            {externalDeviceIdTypes.map(
                                                (externalDeviceIdType, index) => {
                                                    const externalDeviceIdTypeText = (externalDeviceIdType as unknown) as string;

                                                    return (
                                                        <FormInput
                                                            key={index}
                                                            label={externalDeviceIdTypeText}
                                                            property={externalDeviceIdTypeText}
                                                            disabled={fieldDisabled}
                                                            className="mt-3"
                                                        />
                                                    );
                                                }
                                            )}
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            <br />

                            <Grid container spacing={3}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Installation name</TableCell>
                                            <TableCell>Address</TableCell>
                                            <TableCell>Village/Town/City</TableCell>
                                            <TableCell>Latitude</TableCell>
                                            <TableCell>Longitude</TableCell>
                                            <TableCell>Capacity (kW)</TableCell>
                                            <TableCell>Meter id</TableCell>
                                            <TableCell>Meter type</TableCell>
                                            {!readOnly && <TableCell></TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <FieldArray
                                            name="children"
                                            render={(arrayHelpers) => (
                                                <>
                                                    {values.children.map((child, childIndex) => (
                                                        <TableRow key={childIndex}>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.installationName`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.address`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.city`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.latitude`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    type="number"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.longitude`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    type="number"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.capacity`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    type="number"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.meterId`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormInput
                                                                    property={`children.${childIndex}.meterType`}
                                                                    disabled={fieldDisabled}
                                                                    className="mt-3"
                                                                    variant="standard"
                                                                    required
                                                                />
                                                            </TableCell>
                                                            {!readOnly && (
                                                                <TableCell>
                                                                    <span
                                                                        onClick={() => {
                                                                            arrayHelpers.remove(
                                                                                childIndex
                                                                            );
                                                                        }}
                                                                        style={{
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Remove
                                                                    </span>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                    {!readOnly && (
                                                        <TableRow>
                                                            <TableCell colSpan={100}>
                                                                <Button
                                                                    variant="contained"
                                                                    className="mt-3"
                                                                    onClick={() => {
                                                                        arrayHelpers.push(
                                                                            getDefaultDeviceData()
                                                                        );
                                                                    }}
                                                                    disabled={fieldDisabled}
                                                                >
                                                                    Add device
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </TableBody>
                                </Table>
                            </Grid>
                            {!readOnly && (
                                <>
                                    <br />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        className="mt-3"
                                        disabled={buttonDisabled}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
