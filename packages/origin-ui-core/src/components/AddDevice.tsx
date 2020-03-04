import React, { useState } from 'react';
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
import { Formik, Field, Form, FormikHelpers } from 'formik';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../utils/routing';
import { FormikDatePicker } from './Form/FormikDatePicker';
import { getCurrentUser } from '../features/users/selectors';
import { setLoading } from '../features/general/actions';
import {
    getCompliance,
    getRegions,
    getCountry,
    getOffChainDataSource
} from '../features/general/selectors';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import { CloudUpload } from '@material-ui/icons';
import { ProducingDevice, Device } from '@energyweb/device-registry';
import { producingDeviceCreatedOrUpdated } from '../features/producingDevices/actions';
import { PowerFormatter } from '../utils/PowerFormatter';
import { IDevice, DeviceStatus } from '@energyweb/origin-backend-core';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useValidation } from '../utils/validation';

const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

interface IFormValues {
    facilityName: string;
    capacity: string;
    commissioningDate: Moment;
    registrationDate: Moment;
    address: string;
    latitude: string;
    longitude: string;
    supported: boolean;
    projectStory: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    facilityName: '',
    capacity: '',
    commissioningDate: null,
    registrationDate: null,
    address: '',
    latitude: '',
    longitude: '',
    supported: false,
    projectStory: ''
};

export function AddDevice() {
    const currentUser = useSelector(getCurrentUser);
    const configuration = useSelector(getConfiguration);
    const compliance = useSelector(getCompliance);
    const country = useSelector(getCountry);
    const offChainDataSource = useSelector(getOffChainDataSource);
    const regions = useSelector(getRegions);

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { Yup, yupLocaleInitialized } = useValidation();
    const { getDevicesOwnedLink } = useLinks();

    const [selectedDeviceType, setSelectedDeviceType] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
    const [imagesUploaded, setImagesUploaded] = useState(false);
    const [imagesUploadedList, setImagesUploadedList] = useState<string[]>([]);

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

    const VALIDATION_SCHEMA = Yup.object().shape({
        facilityName: Yup.string()
            .label(t('device.properties.facilityName'))
            .required(),
        capacity: Yup.number()
            .label(t('device.properties.capacity'))
            .required()
            .positive(),
        commissioningDate: Yup.date().required(),
        registrationDate: Yup.date().required(),
        address: Yup.string()
            .label(t('device.properties.address'))
            .required(),
        latitude: Yup.number()
            .label(t('device.properties.latitude'))
            .required()
            .positive(),
        longitude: Yup.number()
            .label(t('device.properties.longitude'))
            .required()
            .positive(),
        supported: Yup.boolean(),
        projectStory: Yup.string()
    });

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (!currentUser) {
            return;
        }

        const deviceType = selectedDeviceType.sort((a, b) => b.length - a.length)[0];

        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: DEFAULT_ADDRESS },
            owner: { address: currentUser.id }
        };

        const [region, province] = selectedLocation;

        const deviceProducingPropsOffChain: IDevice = {
            status: DeviceStatus.Submitted,
            deviceType,
            complianceRegistry: compliance,
            facilityName: values.facilityName,
            capacityInW: PowerFormatter.getBaseValueFromValueInDisplayUnit(
                parseFloat(values.capacity)
            ),
            country,
            address: values.address,
            region,
            province: province.split(';')[1],
            gpsLatitude: values.latitude,
            gpsLongitude: values.longitude,
            timezone: 'Asia/Bangkok',
            operationalSince: values.commissioningDate?.unix(),
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: values.projectStory,
            images: JSON.stringify(imagesUploadedList),
            smartMeterReads: []
        };

        try {
            const device = await ProducingDevice.createDevice(
                deviceProducingProps,
                deviceProducingPropsOffChain,
                configuration
            );

            dispatch(producingDeviceCreatedOrUpdated(device));

            showNotification(t('device.feedback.deviceCreated'), NotificationType.Success);

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
                t('device.feedback.pleaseSelectUpToXImages', {
                    limit: 10,
                    actual: files.length
                }),
                NotificationType.Error
            );
            return;
        }

        try {
            const uploadedFiles = await offChainDataSource.filesClient.upload(files);

            setImagesUploaded(true);
            setImagesUploadedList(uploadedFiles);
        } catch (error) {
            showNotification(
                t('device.feedback.unexpectedErrorWhenUploadingImages'),
                NotificationType.Error
            );
        }
    }

    if (!configuration || !yupLocaleInitialized) {
        return <Skeleton variant="rect" height={200} />;
    }

    const initialFormValues: IFormValues = INITIAL_FORM_VALUES;

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
                        <Form translate="">
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        {t('device.info.general')}
                                    </Typography>
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
                                            label={t('device.properties.facilityName')}
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
                                            allValues={configuration.deviceTypeService.deviceTypes}
                                            selectOptions={[
                                                {
                                                    label: t('device.properties.deviceType'),
                                                    placeholder: t('device.info.selectDeviceType')
                                                },
                                                {
                                                    label: t('device.properties.deviceType'),
                                                    placeholder: t('device.info.selectDeviceType')
                                                },
                                                {
                                                    label: t('device.properties.deviceType'),
                                                    placeholder: t('device.info.selectDeviceType')
                                                }
                                            ]}
                                            disabled={fieldDisabled}
                                            singleChoice={true}
                                        />
                                    </div>

                                    <Field
                                        name="commissioningDate"
                                        label={t('device.properties.commissioningDate')}
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
                                        label={t('device.properties.registrationDate')}
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
                                            label: t('device.info.supported')
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
                                            label={`${t('device.properties.capacity')} (${
                                                PowerFormatter.displayUnit
                                            })`}
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
                                                    label: t('device.properties.regions'),
                                                    placeholder: t('device.info.selectRegion')
                                                },
                                                {
                                                    label: t('device.properties.provinces'),
                                                    placeholder: t('device.info.selectProvince')
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
                                            label={t('device.properties.address')}
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
                                            label={t('device.properties.latitude')}
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
                                            label={t('device.properties.longitude')}
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
                                    <Typography className="mt-3">
                                        {t('device.properties.story')}
                                    </Typography>
                                    <FormControl fullWidth variant="filled" className="mt-3">
                                        <Field
                                            label={t('device.properties.projectStory')}
                                            name="projectStory"
                                            component={TextField}
                                            multiline
                                            rows={4}
                                            rowsMax={20}
                                            variant="filled"
                                            fullWidth
                                            disabled={fieldDisabled}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="mt-3">
                                        {t('device.properties.images')}
                                    </Typography>
                                    {imagesUploaded ? (
                                        <p className="mt-3">
                                            {t('device.feedback.imagesUploaded')}
                                            <br />
                                            <br />
                                            {t('device.info.pleaseFillOtherFields')}
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
                                                    {t('device.info.uploadUpToXImages', {
                                                        amount: 10
                                                    })}
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
                                {t('device.actions.register')}
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
