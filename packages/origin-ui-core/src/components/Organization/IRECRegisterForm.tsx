import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIRecClient } from '../../features/general/selectors';
import { setLoading } from '../../features/general/actions';
import { setIRecAccount } from '../../features/users/actions';
import { IRECAccountType, RegistrationIRecPostData } from '../../utils/irec';
import {
    Paper,
    Theme,
    useTheme,
    Grid,
    Box,
    Button,
    Divider,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { showNotification, NotificationType, useTranslation } from '../..';
import { Formik, Form, FormikHelpers } from 'formik';
import { useValidation, LightenColor } from '../../utils';
import { FormInput, FormCountrySelect, FormCountryMultiSelect } from '../Form';
import { IAutocompleteMultiSelectOptionType } from '../MultiSelectAutocomplete';
import irecLogo from '../../../assets/logo-i-rec.svg';
import { FormSelect } from '../Form/FormSelect';
import { IRecAccountRegisteredModal } from '../Modal/IRecAccountRegisteredModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';
import { useOriginConfiguration } from '../../utils/configuration';

interface IFormValues {
    accountType: string;
    headquarterCountry: string;
    registrationYear: string;
    employeesNumber: string;
    shareholders: string;
    website: string;
    activeCountries: IAutocompleteMultiSelectOptionType[];
    mainBusiness: string;
    ceoName: string;
    ceoPassportNumber: string;
    balanceSheetTotal: string;
    primaryContactOrganizationName: string;
    primaryContactOrganizationAddress: string;
    primaryContactOrganizationPostalCode: string;
    primaryContactOrganizationCountry: string;
    subsidiaries?: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhoneNumber: string;
    primaryContactFax: string;
    leadUserTitle: string;
    leadUserTitleInput?: string;
    leadUserFirstName: string;
    leadUserLastName: string;
    leadUserEmail: string;
    leadUserPhoneNumber: string;
    leadUserFax: string;
}

const INITIAL_VALUES: IFormValues = {
    accountType: '',
    headquarterCountry: '',
    registrationYear: '',
    employeesNumber: '',
    shareholders: '',
    website: '',
    activeCountries: [],
    mainBusiness: '',
    ceoName: '',
    ceoPassportNumber: '',
    balanceSheetTotal: '',
    primaryContactOrganizationName: '',
    primaryContactOrganizationAddress: '',
    primaryContactOrganizationPostalCode: '',
    primaryContactOrganizationCountry: '',
    subsidiaries: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhoneNumber: '',
    primaryContactFax: '',
    leadUserTitle: '',
    leadUserTitleInput: '',
    leadUserFirstName: '',
    leadUserLastName: '',
    leadUserEmail: '',
    leadUserPhoneNumber: '',
    leadUserFax: ''
};

const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms', 'Other'].map((option) => {
    return {
        value: option,
        label: option
    };
});

export const IRECRegisterForm = () => {
    const { spacing }: Theme = useTheme();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const [showIRecRegisteredModal, setShowIRecRegisteredModal] = useState<boolean>(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    const iRecClient = useSelector(getIRecClient);
    const dispatch = useDispatch();
    const dividerBgColor = LightenColor(
        useOriginConfiguration()?.styleConfig?.MAIN_BACKGROUND_COLOR,
        10
    );

    const useStyles = makeStyles(() =>
        createStyles({
            divider: {
                backgroundColor: dividerBgColor,
                marginTop: spacing(4),
                marginBottom: spacing(4)
            },
            inputsHolder: {
                paddingLeft: spacing(1),
                paddingRight: spacing(1)
            },
            buttonContainer: {
                paddingTop: spacing(4),
                paddingRight: spacing(1)
            }
        })
    );

    const classes = useStyles(useTheme());

    const accountTypeOptions = [
        {
            value: IRECAccountType.Registrant,
            label: t('organization.registration.irecRegistrantDescription')
        },
        {
            value: IRECAccountType.Participant,
            label: t('organization.registration.irecParticipantDescription')
        },
        {
            value: IRECAccountType.Both,
            label: t('organization.registration.irecBothDescription')
        }
    ];

    const numberOfEmployeesOptions = ['1-50', '50-100', '100-300', '300+'].map((option) => {
        return {
            value: option,
            label: option
        };
    });

    const onRegister = async (
        values: typeof INITIAL_VALUES,
        { setSubmitting }: FormikHelpers<typeof INITIAL_VALUES>
    ) => {
        if (values.headquarterCountry === '' || values.activeCountries === []) {
            return;
        }
        dispatch(setLoading(true));

        try {
            setSubmitting(true);

            const formData: RegistrationIRecPostData = {
                ...values,
                accountType: (values.accountType as unknown) as IRECAccountType,
                registrationYear: parseInt(values.registrationYear, 10),
                activeCountries: values.activeCountries.map((i) => i?.code),
                leadUserTitle:
                    values.leadUserTitle === 'Other'
                        ? values.leadUserTitleInput
                        : values.leadUserTitle
            };

            const { data: iRecAccount } = await iRecClient.organizationClient.register(formData);

            if (iRecAccount) {
                setSubmitting(false);
                dispatch(setIRecAccount(iRecAccount));
                setShowIRecRegisteredModal(true);
            }
        } catch (error) {
            console.warn('Error while registering an organization', error);
            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else {
                showNotification('Organization could not be created.', NotificationType.Error);
            }
        }
        dispatch(setLoading(false));
    };

    const VALIDATION_SCHEME = Yup.object({
        accountType: Yup.string().required().label(t('organization.registration.IRECAccountType')),
        headquarterCountry: Yup.string()
            .required()
            .label(t('organization.registration.orgHeadquartersCountry')),
        registrationYear: Yup.number()
            .min(1900)
            .required()
            .label(t('organization.registration.yearRegistration')),
        employeesNumber: Yup.string()
            .required()
            .label(t('organization.registration.numberOfEmployees')),
        shareholders: Yup.string()
            .required()
            .label(t('organization.registration.shareholderNames')),
        website: Yup.string().url().required().label(t('organization.registration.orgWebsite')),
        activeCountries: Yup.array()
            .required()
            .label(t('organization.registration.activeCountries')),
        mainBusiness: Yup.string().required().label(t('organization.registration.mainBusiness')),
        ceoName: Yup.string().required().label(t('organization.registration.ceoName')),
        ceoPassportNumber: Yup.string()
            .required()
            .label(t('organization.registration.ceoPassport')),
        balanceSheetTotal: Yup.string()
            .required()
            .label(t('organization.registration.lastBalance')),
        primaryContactOrganizationName: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactOrgName')),
        primaryContactOrganizationAddress: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactOrgAddress')),
        primaryContactOrganizationPostalCode: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactOrgPostalCode')),
        primaryContactOrganizationCountry: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactOrgCountry')),
        subsidiaries: Yup.string().label(t('organization.registration.existingIRECOrg')),
        primaryContactName: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactName')),
        primaryContactEmail: Yup.string()
            .email()
            .required()
            .label(t('organization.registration.primaryContactEmail')),
        primaryContactPhoneNumber: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactPhoneNumber')),
        primaryContactFax: Yup.string()
            .required()
            .label(t('organization.registration.primaryContactFax')),
        leadUserTitle: Yup.string().required().label(t('organization.registration.leadUserTitle')),
        leadUserTitleInput: Yup.string().label(t('organization.registration.leadUserTitle')),
        leadUserFirstName: Yup.string()
            .required()
            .label(t('organization.registration.leadUserFirstName')),
        leadUserLastName: Yup.string()
            .required()
            .label(t('organization.registration.leadUserLastName')),
        leadUserEmail: Yup.string()
            .email()
            .required()
            .label(t('organization.registration.leadUserEmail')),
        leadUserPhoneNumber: Yup.string()
            .required()
            .label(t('organization.registration.leadUserPhoneNumber')),
        leadUserFax: Yup.string().required().label(t('organization.registration.leadUserFax'))
    });

    return (
        <Paper elevation={1} style={{ padding: spacing(2) }}>
            <Formik
                onSubmit={onRegister}
                initialValues={INITIAL_VALUES}
                validationSchema={VALIDATION_SCHEME}
                validateOnMount={true}
            >
                {(formikProps) => {
                    const { values, isValid, isSubmitting, setFieldValue } = formikProps;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <Form translate="no">
                            <Grid container direction="column">
                                <Grid item container>
                                    <Grid item container direction="column" xs={6}>
                                        <Grid item>
                                            <Box
                                                fontWeight="fontWeightBold"
                                                style={{ textTransform: 'uppercase' }}
                                                pb={2}
                                            >
                                                {t('organization.registration.titleRegisterIREC')}
                                            </Box>
                                        </Grid>
                                        <Grid item style={{ paddingLeft: spacing(1) }}>
                                            <FormSelect
                                                options={accountTypeOptions}
                                                label={t(
                                                    'organization.registration.IRECAccountType'
                                                )}
                                                property="accountType"
                                                currentValue={values.accountType}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />

                                            <FormCountrySelect
                                                label={t(
                                                    'organization.registration.orgHeadquartersCountry'
                                                )}
                                                property="headquarterCountry"
                                                currentValue={values.headquarterCountry}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <Grid container justify="space-between">
                                                <Grid item xs={5}>
                                                    <FormInput
                                                        label={t(
                                                            'organization.registration.yearOfRegistration'
                                                        )}
                                                        property="registrationYear"
                                                        disabled={isSubmitting}
                                                        className="mt-3"
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <FormSelect
                                                        options={numberOfEmployeesOptions}
                                                        label={t(
                                                            'organization.registration.numberOfEmployees'
                                                        )}
                                                        property="employeesNumber"
                                                        currentValue={values.employeesNumber}
                                                        disabled={isSubmitting}
                                                        className="mt-3"
                                                        required
                                                    />
                                                </Grid>
                                            </Grid>
                                            <FormInput
                                                label={t(
                                                    'organization.registration.shareholderNames'
                                                )}
                                                property="shareholders"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.orgWebsite')}
                                                property="website"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormCountryMultiSelect
                                                onChange={(value) =>
                                                    setFieldValue('activeCountries', value, true)
                                                }
                                                label={t(
                                                    'organization.registration.activeCountries'
                                                )}
                                                placeholder="Select active countries"
                                                selectedValues={values.activeCountries}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                isoFormat={true}
                                                max={3}
                                            />
                                            <FormInput
                                                label={t('organization.registration.mainBusiness')}
                                                property="mainBusiness"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.ceoName')}
                                                property="ceoName"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.ceoPassport')}
                                                property="ceoPassportNumber"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.lastBalance')}
                                                property="balanceSheetTotal"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={6} style={{ position: 'relative' }}>
                                        <Box position="absolute" top="10%" left="50%">
                                            <Box position="relative" left="-50%">
                                                <img src={irecLogo} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Divider className={classes.divider} />
                                <Grid item container>
                                    <Grid item container direction="column" xs={12}>
                                        <Grid item>
                                            <Box
                                                fontWeight="fontWeightBold"
                                                style={{ textTransform: 'uppercase' }}
                                                pb={2}
                                            >
                                                {t(
                                                    'organization.registration.primaryContactBlockTitle'
                                                )}
                                            </Box>
                                        </Grid>
                                        <Grid item className={classes.inputsHolder}>
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactOrgName'
                                                )}
                                                property="primaryContactOrganizationName"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactOrgAddress'
                                                )}
                                                property="primaryContactOrganizationAddress"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactOrgPostalCode'
                                                )}
                                                property="primaryContactOrganizationPostalCode"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormCountrySelect
                                                label={t(
                                                    'organization.registration.primaryContactOrgCountry'
                                                )}
                                                property="primaryContactOrganizationCountry"
                                                currentValue={
                                                    values.primaryContactOrganizationCountry
                                                }
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.existingIRECOrg'
                                                )}
                                                property="subsidiaries"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactName'
                                                )}
                                                property="primaryContactName"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactEmail'
                                                )}
                                                property="primaryContactEmail"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactPhoneNumber'
                                                )}
                                                property="primaryContactPhoneNumber"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.primaryContactFax'
                                                )}
                                                property="primaryContactFax"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Divider className={classes.divider} />
                                <Grid item container>
                                    <Grid item container direction="column" xs={12}>
                                        <Grid item>
                                            <Box
                                                fontWeight="fontWeightBold"
                                                style={{ textTransform: 'uppercase' }}
                                                pb={2}
                                            >
                                                {t('organization.registration.leadUserBlockTitle')}
                                            </Box>
                                        </Grid>
                                        <Grid item className={classes.inputsHolder}>
                                            <FormSelect
                                                options={TITLE_OPTIONS}
                                                label={t('organization.registration.leadUserTitle')}
                                                property="leadUserTitle"
                                                currentValue={values.leadUserTitle}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            {values.leadUserTitle === 'Other' && (
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.leadUserTitle'
                                                    )}
                                                    property="leadUserTitleInput"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            )}
                                            <FormInput
                                                label={t(
                                                    'organization.registration.leadUserFirstName'
                                                )}
                                                property="leadUserFirstName"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.leadUserLastName'
                                                )}
                                                property="leadUserLastName"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.leadUserEmail')}
                                                property="leadUserEmail"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t(
                                                    'organization.registration.leadUserPhoneNumber'
                                                )}
                                                property="leadUserPhoneNumber"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <FormInput
                                                label={t('organization.registration.leadUserFax')}
                                                property="leadUserFax"
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid
                                    item
                                    container
                                    justify="flex-end"
                                    className={classes.buttonContainer}
                                >
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            disabled={buttonDisabled}
                                        >
                                            {t(
                                                'organization.registration.actions.registerOrganization'
                                            )}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Form>
                    );
                }}
            </Formik>
            <IRecAccountRegisteredModal
                showModal={showIRecRegisteredModal}
                setShowModal={setShowIRecRegisteredModal}
                setShowBlockchainModal={setShowBlockchainModal}
            />
            <ConnectBlockchainAccountModal
                showModal={showBlockchainModal}
                setShowModal={setShowBlockchainModal}
            />
        </Paper>
    );
};
