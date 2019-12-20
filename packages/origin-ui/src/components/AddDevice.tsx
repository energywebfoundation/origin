import React, { useState } from 'react';
import { IRECDeviceService, Unit } from '@energyweb/utils-general';
import { showNotification, NotificationType } from '../utils/notifications';
import {
    Paper,
    Typography,
    FormControl,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration } from '../features/selectors';
import { Moment } from 'moment';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../utils/routing';
import { FormikDatePicker } from './FormikDatePicker';
import { getCurrentUser } from '../features/users/selectors';
import { setLoading } from '../features/general/actions';
import { getCompliance, getEnvironment, getRegions } from '../features/general/selectors';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import { Skeleton } from '@material-ui/lab';
import { CloudUpload } from '@material-ui/icons';
import { ProducingDevice, Device } from '@energyweb/device-registry';
import axios from 'axios';
import { DEFAULT_COUNTRY } from './Demand/DemandForm';
import { producingDeviceCreatedOrUpdated } from '../features/producingDevices/actions';

const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

interface IFormValues {
    facilityName: string;
    capacity: string;
    comissioningDate: Moment;
    registrationDate: Moment;
    address: string;
    latitude: string;
    longitude: string;
    supported: boolean;
    projectStory: string;
}

const INITIAL_FORM_VALUES_TEST: IFormValues = {
    facilityName: '',
    capacity: '',
    comissioningDate: null,
    registrationDate: null,
    address: '',
    latitude: '',
    longitude: '',
    supported: false,
    projectStory: ''
};

const INITIAL_FORM_VALUES: IFormValues = INITIAL_FORM_VALUES_TEST || {
    facilityName: '',
    capacity: '',
    comissioningDate: null,
    registrationDate: null,
    address: '',
    latitude: '',
    longitude: '',
    supported: false,
    projectStory: ''
};

const VALIDATION_SCHEMA = Yup.object().shape({
    facilityName: Yup.string()
        .label('Facility name')
        .required(),
    capacity: Yup.number()
        .label('Capacity')
        .required('Required')
        .positive('Number has to be positive'),
    comissioningDate: Yup.date().required(),
    registrationDate: Yup.date().required(),
    address: Yup.string()
        .label('Address')
        .required(),
    latitude: Yup.number()
        .label('Latitude')
        .required('Required')
        .positive('Number has to be positive'),
    longitude: Yup.number()
        .label('Longitude')
        .required('Required')
        .positive('Number has to be positive'),
    supported: Yup.boolean(),
    projectStory: Yup.string()
});

export function AddDevice() {
    const currentUser = useSelector(getCurrentUser);
    const configuration = useSelector(getConfiguration);
    const compliance = useSelector(getCompliance);
    const environment = useSelector(getEnvironment);

    const dispatch = useDispatch();
    const { getDevicesOwnedLink } = useLinks();

    const irecDeviceService = new IRECDeviceService();

    const [selectedDeviceType, setSelectedDeviceType] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
    const [imagesUploaded, setImagesUploaded] = useState(false);
    const [imagesUploadedList, setImagesUploadedList] = useState([]);

    const history = useHistory();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            },
            selectContainer: {
                paddingTop: '10px'
            },
            fileUploadInput: {
                display: 'none'
            }
        })
    );

    const classes = useStyles(useTheme());

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        const deviceType = selectedDeviceType.sort((a, b) => b.length - a.length)[0];

        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: DEFAULT_ADDRESS },
            owner: { address: currentUser.id },
            lastSmartMeterReadWh: 0,
            status: Device.DeviceStatus.Submitted,
            usageType: Device.UsageType.Producing,
            lastSmartMeterReadFileHash: '',
            propertiesDocumentHash: null,
            url: null
        };

        const [region, province] = selectedLocation;

        const deviceProducingPropsOffChain: ProducingDevice.IOffChainProperties = {
            deviceType,
            complianceRegistry: compliance,
            facilityName: values.facilityName,
            capacityWh: parseFloat(values.capacity) * Unit.kW,
            country: DEFAULT_COUNTRY,
            address: values.address,
            region,
            province: province.split(';')[1],
            gpsLatitude: values.latitude,
            gpsLongitude: values.longitude,
            timezone: 'Asia/Bangkok',
            operationalSince: values.comissioningDate?.unix(),
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: values.projectStory,
            images: JSON.stringify(imagesUploadedList)
        };

        try {
            const device = await ProducingDevice.createDevice(
                deviceProducingProps,
                deviceProducingPropsOffChain,
                configuration
            );

            dispatch(producingDeviceCreatedOrUpdated(device));

            showNotification('Device successfully created.', NotificationType.Success);

            history.push(getDevicesOwnedLink());
        } catch (error) {
            throw new Error(error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    async function uploadImages(files: FileList) {
        if (files.length > 10) {
            showNotification(
                `Please select up to 10 images. You've selected ${files.length}.`,
                NotificationType.Error
            );
            return;
        }

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append(`images`, files[i]);
        }

        try {
            const response = await axios.post(`${environment.BACKEND_URL}/api/Image`, formData, {
                headers: { 'Content-type': 'multipart/form-data' }
            });

            setImagesUploaded(true);
            setImagesUploadedList(response.data);
        } catch (error) {
            showNotification(
                `Unexpected error occurred when ploading images.`,
                NotificationType.Error
            );
        }
    }

    const initialFormValues: IFormValues = INITIAL_FORM_VALUES;

    if (!initialFormValues) {
        return <Skeleton variant="rect" height={200} />;
    }

    const regions = useSelector(getRegions);

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {formikProps => {
                    const { isValid, isSubmitting } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled =
                        isSubmitting ||
                        !isValid ||
                        selectedDeviceType.length === 0 ||
                        selectedLocation.length < 2;

                    return (
                        <Form>
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
                                            onChange={(value: string[]) =>
                                                setSelectedDeviceType(value)
                                            }
                                            allValues={irecDeviceService.DeviceTypes}
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
                                            disabled={fieldDisabled}
                                            singleChoice={true}
                                        />
                                    </div>

                                    <Field
                                        name="comissioningDate"
                                        label="Comissioning date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={fieldDisabled}
                                    />
                                    <Field
                                        name="registrationDate"
                                        label="Registration date"
                                        className="mt-3"
                                        inputVariant="filled"
                                        variant="inline"
                                        fullWidth
                                        required
                                        component={FormikDatePicker}
                                        disabled={fieldDisabled}
                                    />
                                    <Field
                                        name="supported"
                                        Label={{
                                            label: 'Supported'
                                        }}
                                        color="primary"
                                        component={CheckboxWithLabel}
                                        disabled={fieldDisabled}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            label="Capacity (kW)"
                                            name="capacity"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                    <div className={classes.selectContainer}>
                                        <HierarchicalMultiSelect
                                            selectedValue={selectedLocation}
                                            onChange={(value: string[]) =>
                                                setSelectedLocation(value)
                                            }
                                            options={regions}
                                            selectOptions={[
                                                {
                                                    label: 'Regions',
                                                    placeholder: 'Select region'
                                                },
                                                {
                                                    label: 'Provinces',
                                                    placeholder: 'Select province'
                                                }
                                            ]}
                                            singleChoice={true}
                                            disabled={fieldDisabled}
                                        />
                                    </div>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            label="Address"
                                            name="address"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            label="Latitude"
                                            name="latitude"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            label="Longitude"
                                            name="longitude"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Story</Typography>
                                    <FormControl fullWidth variant="filled" className="mt-3">
                                        <Field
                                            label="Project story"
                                            name="projectStory"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">Images</Typography>
                                    {imagesUploaded ? (
                                        <p className="mt-3">
                                            Images have been uploaded.
                                            <br />
                                            <br />
                                            Please fill other form fields and proceed by clicking
                                            &quot;Register&quot;.
                                        </p>
                                    ) : (
                                        <>
                                            <input
                                                className={classes.fileUploadInput}
                                                id="contained-button-file"
                                                type="file"
                                                onChange={e => uploadImages(e.target.files)}
                                                multiple
                                                disabled={imagesUploaded}
                                            />
                                            <label htmlFor="contained-button-file" className="mt-3">
                                                <Button
                                                    startIcon={<CloudUpload />}
                                                    component="span"
                                                    variant="outlined"
                                                    disabled={imagesUploaded}
                                                >
                                                    Upload up to 10 images
                                                </Button>
                                            </label>
                                        </>
                                    )}
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Register
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
