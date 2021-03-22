import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    makeStyles,
    createStyles,
    useTheme,
    Paper,
    Grid,
    TextField,
    Box,
    Theme
} from '@material-ui/core';
import { Countries } from '@energyweb/utils-general';
import { IRECAccountType } from '../../../utils/irec';

interface IValues {
    id: string;
    owner: string;
    accountType: IRECAccountType;
    headquarterCountry: string;
    registrationYear: number;
    employeesNumber: string;
    shareholders: string;
    website: string;
    activeCountries: string[];
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
    leadUserFirstName: string;
    leadUserLastName: string;
    leadUserEmail: string;
    leadUserPhoneNumber: string;
    leadUserFax: string;
}

export function IRECOrganizationView({ iRecOrg }) {
    const [formValues, setFormValues] = useState<IValues>(null);
    const { t } = useTranslation();
    const { spacing }: Theme = useTheme();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '20px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const accountTypeCheck = (type) => {
        switch (type) {
            case IRECAccountType.Participant:
                return t('organization.registration.irecParticipantDescription');
                break;
            case IRECAccountType.Registrant:
                return t('organization.registration.irecRegistrantDescription');
                break;
            case IRECAccountType.Both:
                return t('organization.registration.irecBothDescription');
                break;
        }
    };

    const setValues = (iRecData) => {
        setFormValues({
            ...iRecData,
            accountType: accountTypeCheck(iRecData.accountType),
            headquarterCountry: Countries.find((c) => c.code === iRecData.headquarterCountry).name,
            activeCountries: Countries.filter((c) => iRecData.activeCountries.includes(c.code))
                .map((country) => country.name)
                .join(', '),
            primaryContactOrganizationCountry: Countries.find(
                (c) => c.code === iRecData.primaryContactOrganizationCountry
            ).name
        });
    };

    useEffect(() => {
        if (iRecOrg) {
            setValues(iRecOrg);
        }
    }, [iRecOrg]);

    if (!formValues) {
        return null;
    }

    return (
        <Paper className={classes.container}>
            <Grid item>
                <Box style={{ textTransform: 'uppercase' }}>
                    {t('organization.registration.irecInformation')}
                </Box>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        data-cy="irec-account-type"
                        label={t('organization.registration.IRECAccountType')}
                        className="mt-3"
                        value={formValues.accountType}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="org-headquaters-country"
                        label={t('organization.registration.orgHeadquartersCountry')}
                        className="mt-3"
                        value={formValues.headquarterCountry}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="year-registration"
                        label={t('organization.registration.yearOfRegistration')}
                        value={formValues.registrationYear}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="number-of-employees"
                        label={t('organization.registration.numberOfEmployees')}
                        className="mt-3"
                        value={formValues.employeesNumber}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="shareholders-names"
                        label={t('organization.registration.shareholderNames')}
                        className="mt-3"
                        value={formValues.shareholders}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="org-website"
                        label={t('organization.registration.orgWebsite')}
                        className="mt-3"
                        value={formValues.website}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        data-cy="active-countries"
                        label={t('organization.registration.activeCountries')}
                        value={formValues.activeCountries}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        data-cy="main-business"
                        label={t('organization.registration.mainBusiness')}
                        value={formValues.mainBusiness}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        data-cy="ceo-name"
                        label={t('organization.registration.ceoName')}
                        value={formValues.ceoName}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        data-cy="ceo-passport"
                        label={t('organization.registration.ceoPassport')}
                        value={formValues.ceoPassportNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        data-cy="last-balance"
                        label={t('organization.registration.lastBalance')}
                        value={formValues.balanceSheetTotal}
                        disabled
                        className="mt-3"
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid item style={{ paddingTop: spacing(5) }}>
                <Box style={{ textTransform: 'uppercase' }}>
                    {t('organization.registration.primaryContactBlockTitle')}
                </Box>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        data-cy="primary-contact-org-name"
                        label={t('organization.registration.primaryContactOrgName')}
                        className="mt-3"
                        value={formValues.primaryContactOrganizationName}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-org-address"
                        label={t('organization.registration.primaryContactOrgAddress')}
                        className="mt-3"
                        value={formValues.primaryContactOrganizationAddress}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-org-postal-code"
                        label={t('organization.registration.primaryContactOrgPostalCode')}
                        value={formValues.primaryContactOrganizationPostalCode}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-org-country"
                        label={t('organization.registration.primaryContactOrgCountry')}
                        className="mt-3"
                        value={formValues.primaryContactOrganizationCountry}
                        fullWidth
                        disabled
                    />

                    {formValues.subsidiaries && (
                        <TextField
                            data-cy="primary-contact-existing-irec"
                            label={t('organization.registration.existingIRECOrg')}
                            value={formValues.subsidiaries}
                            disabled
                            className="mt-3"
                            fullWidth
                        />
                    )}
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        data-cy="primary-contact-person-name"
                        label={t('organization.registration.primaryContactName')}
                        className="mt-3"
                        value={formValues.primaryContactName}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-person-email"
                        label={t('organization.registration.primaryContactEmail')}
                        className="mt-3"
                        value={formValues.primaryContactEmail}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-person-phone"
                        label={t('organization.registration.primaryContactPhoneNumber')}
                        value={formValues.primaryContactPhoneNumber}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="primary-contact-person-fax"
                        label={t('organization.registration.primaryContactFax')}
                        className="mt-3"
                        value={formValues.primaryContactFax}
                        fullWidth
                        disabled
                    />
                </Grid>
            </Grid>
            <Grid item style={{ paddingTop: spacing(5) }}>
                <Box style={{ textTransform: 'uppercase' }}>
                    {t('organization.registration.leadUserBlockTitle')}
                </Box>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        data-cy="lead-user-title"
                        label={t('organization.registration.leadUserTitle')}
                        className="mt-3"
                        value={formValues.leadUserTitle}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="lead-user-first-name"
                        label={t('organization.registration.leadUserFirstName')}
                        className="mt-3"
                        value={formValues.leadUserFirstName}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="lead-user-last-name"
                        label={t('organization.registration.leadUserLastName')}
                        value={formValues.leadUserLastName}
                        className="mt-3"
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        data-cy="lead-user-email"
                        label={t('organization.registration.leadUserEmail')}
                        className="mt-3"
                        value={formValues.leadUserEmail}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="lead-user-phone"
                        label={t('organization.registration.leadUserPhoneNumber')}
                        className="mt-3"
                        value={formValues.leadUserPhoneNumber}
                        fullWidth
                        disabled
                    />

                    <TextField
                        data-cy="lead-user-fax"
                        label={t('organization.registration.leadUserFax')}
                        value={formValues.leadUserFax}
                        className="mt-3"
                        fullWidth
                        disabled
                    />
                </Grid>
            </Grid>
        </Paper>
    );
}
