import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { IFullOrganization, OrganizationPostData } from '@energyweb/origin-backend-core';

import {
    Paper,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    Box,
    Divider,
    Typography,
    Theme
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { getOffChainDataSource, showNotification, NotificationType, useTranslation } from '../..';
import { Upload, IUploadedFile } from '../Upload';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { FormCountrySelect } from '../Form/FormCountrySelect';
import { FormBusinessTypeSelect } from '../Form/FormBusinessTypeSelect';
import { setUserOffchain } from '../../features/users/actions';
import { getUserOffchain } from '../../features/users/selectors';
import { RoleChangedModal } from '../Modal/RoleChangedModal';
import { IRECConnectOrRegisterModal } from '../Modal/IRECConnectOrRegisterModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';
import { OrganizationAlreadyExistsModal } from '../Modal/OrganizationAlreadyExistsModal';

interface IProps {
    entity: IFullOrganization;
    readOnly: boolean;
}

interface IFormValues {
    name: string;
    address: string;
    businessType: string;
    city: string;
    zipCode: string;
    country: number | '';
    tradeRegistryCompanyNumber: string;
    vatNumber: string;
    signatoryAddress: string;
    signatoryCity: string;
    signatoryCountry: number | '';
    signatoryEmail: string;
    signatoryFullName: string;
    signatoryPhoneNumber: string;
    signatoryZipCode: string;
    signatoryDocumentIds?: string[];
    documentIds?: string[];
}

const INITIAL_FORM_VALUES: IFormValues = {
    name: '',
    address: '',
    businessType: '',
    city: '',
    zipCode: '',
    country: '',
    tradeRegistryCompanyNumber: '',
    vatNumber: '',
    signatoryAddress: '',
    signatoryCity: '',
    signatoryCountry: '',
    signatoryEmail: '',
    signatoryFullName: '',
    signatoryPhoneNumber: '',
    signatoryZipCode: '',
    signatoryDocumentIds: [],
    documentIds: []
};

const VALIDATION_SCHEMA = Yup.object({
    name: Yup.string().required().label('Name'),
    address: Yup.string().required().label('Address'),
    businessType: Yup.string().required().label('Business Type'),
    city: Yup.string().required().label('City'),
    zipCode: Yup.string().required().label('Zip Code'),
    country: Yup.string().label('Country'),
    tradeRegistryCompanyNumber: Yup.string().required().label('Trade Registry Company Number'),
    vatNumber: Yup.string().required().label('VAT number'),
    signatoryAddress: Yup.string().required().label('Signatory Address'),
    signatoryCity: Yup.string().required().label('Signatory City'),
    signatoryCountry: Yup.string().required().label('Signatory Country'),
    signatoryEmail: Yup.string().email().required().label('Signatory Email'),
    signatoryFullName: Yup.string().required().label('Signatory Full Name'),
    signatoryPhoneNumber: Yup.string().required().label('Signatory Phone Number'),
    signatoryZipCode: Yup.string().required().label('Signatory Zip Code'),
    signatoryDocumentIds: Yup.array().label('Upload Signatory ID'),
    documentIds: Yup.array().label('Upload Company Proof')
});

export function OrganizationForm(props: IProps) {
    const { entity, readOnly } = props;
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const [initialFormValuesFromExistingEntity, setInitialFormValuesFromExistingEntity] = useState<
        IFormValues
    >(null);
    const [companyProofs, setCompanyProofs] = useState<IUploadedFile[]>([]);
    const [signatoryId, setSignatoryId] = useState<IUploadedFile[]>([]);
    const user = useSelector(getUserOffchain);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showIRecModal, setShowIRecModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);
    const [showAlreadyExistsModal, setShowAlreadyExistsModal] = useState(false);

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '30px'
            }
        })
    );

    const classes = useStyles(useTheme());
    const { spacing }: Theme = useTheme();

    useEffect(() => {
        function setupFormBasedOnExistingEntity() {
            setInitialFormValuesFromExistingEntity(entity);
        }

        if (entity && readOnly) {
            setupFormBasedOnExistingEntity();
        }
    }, [entity]);

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (values.signatoryCountry === '' || values.country === '') {
            return;
        }
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            const formData: OrganizationPostData = {
                ...values,
                country: values.country,
                signatoryCountry: values.signatoryCountry,
                documentIds: companyProofs
                    .filter((doc) => !doc.removed)
                    .map((doc) => doc.uploadedName),
                signatoryDocumentIds: signatoryId
                    .filter((doc) => !doc.removed)
                    .map((doc) => doc.uploadedName)
            };

            const organization = await organizationClient.add(formData);
            dispatch(setUserOffchain({ ...user, organization }));

            if (organization) {
                setShowRoleModal(true);
                showNotification('Organization registered.', NotificationType.Success);
            }
        } catch (error) {
            console.warn('Error while registering an organization', error);

            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else if (error?.response?.status === 400) {
                setShowAlreadyExistsModal(true);
                showNotification(error?.response?.data?.message, NotificationType.Error);
            } else {
                showNotification('Organization could not be created.', NotificationType.Error);
            }
        }
        formikActions.setSubmitting(false);
        dispatch(setLoading(false));
    }

    let initialFormValues: IFormValues = null;

    if (entity && readOnly) {
        initialFormValues = initialFormValuesFromExistingEntity;
    } else {
        initialFormValues = INITIAL_FORM_VALUES;
    }

    if (!initialFormValues) {
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
                    const buttonDisabled =
                        isSubmitting || !isValid || !companyProofs.length || !signatoryId.length;

                    return (
                        <div>
                            <Box style={{ textTransform: 'uppercase' }} mb={2}>
                                {t('organization.registration.registerOrganization')}
                            </Box>
                            <Divider className="divider" />
                            <Form translate="no">
                                <Grid container direction="column">
                                    <Grid container style={{ paddingBottom: spacing(4) }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                <Typography className="mt-3">
                                                    {t(
                                                        'organization.registration.organizationInformation'
                                                    )}
                                                </Typography>
                                            </Box>
                                            <FormInput
                                                label={t(
                                                    'organization.registration.organizationName'
                                                )}
                                                property="name"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t(
                                                    'organization.registration.organizationAddress'
                                                )}
                                                property="address"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t('organization.registration.zipCode')}
                                                property="zipCode"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t('organization.registration.city')}
                                                property="city"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormCountrySelect
                                                label={t('organization.registration.country')}
                                                property="country"
                                                currentValue={values.country}
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormBusinessTypeSelect
                                                label={t('organization.registration.businessType')}
                                                selectProperty="businessType"
                                                selectCurrentValue={values.businessType}
                                                inputProperty="businessTypeInput"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t(
                                                    'organization.registration.tradeRegistryNumber'
                                                )}
                                                property="tradeRegistryCompanyNumber"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t('organization.registration.vatNumber')}
                                                property="vatNumber"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box pl={6} mt={6}>
                                                <Typography>
                                                    {t(
                                                        'organization.registration.uploadCompanyProof'
                                                    )}
                                                </Typography>
                                                <Upload
                                                    onChange={(newFiles) =>
                                                        setCompanyProofs(newFiles)
                                                    }
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <Divider className="divider" />
                                    <Grid container style={{ paddingTop: spacing(3) }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                {t(
                                                    'organization.registration.signatoryInformation'
                                                )}
                                            </Box>
                                            <FormInput
                                                label={t('organization.registration.signatoryName')}
                                                property="signatoryFullName"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t(
                                                    'organization.registration.signatoryAddress'
                                                )}
                                                property="signatoryAddress"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t('organization.registration.zipCode')}
                                                property="signatoryZipCode"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t('organization.registration.city')}
                                                property="signatoryCity"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormCountrySelect
                                                label={t('organization.registration.country')}
                                                property="signatoryCountry"
                                                currentValue={values.signatoryCountry}
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t(
                                                    'organization.registration.signatoryEmail'
                                                )}
                                                property="signatoryEmail"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />

                                            <FormInput
                                                label={t(
                                                    'organization.registration.signatoryTelephone'
                                                )}
                                                property="signatoryPhoneNumber"
                                                disabled={fieldDisabled}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box pl={6} mt={6}>
                                                <Typography>
                                                    {t(
                                                        'organization.registration.uploadSignatoryId'
                                                    )}
                                                </Typography>
                                                <Upload
                                                    onChange={(newFiles) =>
                                                        setSignatoryId(newFiles)
                                                    }
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {!readOnly && (
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            className="mt-3 right"
                                            disabled={buttonDisabled}
                                        >
                                            {t('organization.registration.registerOrganization')}
                                        </Button>
                                    </Box>
                                )}
                            </Form>
                        </div>
                    );
                }}
            </Formik>
            <RoleChangedModal
                showModal={showRoleModal}
                setShowModal={setShowRoleModal}
                setShowIRec={setShowIRecModal}
                setShowBlockchainModal={setShowBlockchainModal}
            />
            <IRECConnectOrRegisterModal
                showModal={showIRecModal}
                setShowModal={setShowIRecModal}
                setShowBlockchainModal={setShowBlockchainModal}
            />
            <ConnectBlockchainAccountModal
                showModal={showBlockchainModal}
                setShowModal={setShowBlockchainModal}
            />
            <OrganizationAlreadyExistsModal
                showModal={showAlreadyExistsModal}
                setShowModal={setShowAlreadyExistsModal}
            />
        </Paper>
    );
}
