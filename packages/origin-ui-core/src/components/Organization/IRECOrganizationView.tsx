import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles, useTheme, Paper, Grid, TextField, Box } from '@material-ui/core';
import { Countries } from '@energyweb/utils-general';
import { useTranslation } from '../..';
import { IRECAccountType } from '../../utils/irec';

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
    subsidiaries?: string;
}

export function IRECOrganizationView({ iRecOrg }) {
    const [formValues, setFormValues] = useState<IValues>(null);
    const { t } = useTranslation();

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
                .join(', ')
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
                <Box style={{ textTransform: 'uppercase' }}>{'I-REC Information'}</Box>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        label={t('organization.registration.IRECAccountType')}
                        className="mt-3"
                        value={formValues.accountType}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label={t('organization.registration.orgHeadquatersCompany')}
                        className="mt-3"
                        value={formValues.headquarterCountry}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label={t('organization.registration.yearOfRegistration')}
                        value={formValues.registrationYear}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        label={t('organization.registration.numberOfEmployees')}
                        className="mt-3"
                        value={formValues.employeesNumber}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label={t('organization.registration.shareholderNames')}
                        className="mt-3"
                        value={formValues.shareholders}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label={t('organization.registration.orgWebsite')}
                        className="mt-3"
                        value={formValues.website}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label={t('organization.registration.activeCountries')}
                        value={formValues.activeCountries}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label={t('organization.registration.mainBusiness')}
                        value={formValues.mainBusiness}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label={t('organization.registration.ceoName')}
                        value={formValues.ceoName}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label={t('organization.registration.ceoPassport')}
                        value={formValues.ceoPassportNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label={t('organization.registration.lastBalance')}
                        value={formValues.balanceSheetTotal}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    {formValues.subsidiaries && (
                        <TextField
                            label={t('organization.registration.existingIRECOrg')}
                            value={formValues.subsidiaries}
                            disabled
                            className="mt-3"
                            fullWidth
                        />
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}
