import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { makeStyles, createStyles, useTheme, Paper, Grid, TextField, Box } from '@material-ui/core';
import { Countries } from '@energyweb/utils-general';
import { useTranslation } from '../..';
import { getIRecClient } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { Role, isRole } from '@energyweb/origin-backend-core';
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

export function IRECOrganizationView() {
    const user = useSelector(getUserOffchain);
    const params: { id?: string } = useParams();
    const [formValues, setFormValues] = useState<IValues>(null);
    const iRecClient = useSelector(getIRecClient);
    const isAdminOrSupport = isRole(user, Role.Admin, Role.SupportAgent);
    const { t } = useTranslation();

    const accountTypeCheck = (type) => {
        switch (type) {
            case IRECAccountType.Participant:
                return t('organization.registration.irecParticipantDescription');
                break;
            case IRECAccountType.Registrant:
                return t('organization.registration.irecRegistrantDescription');
                break;
        }
    };

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '20px'
            }
        })
    );

    const classes = useStyles(useTheme());

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
        const getIRecOrganization = async () => {
            if (isAdminOrSupport) {
                const iRecOrg = params.id
                    ? await iRecClient.getRegistrationsById(parseInt(params.id, 10))
                    : null;
                if (iRecOrg?.length) {
                    setValues(iRecOrg[0]);
                }
            } else {
                const iRecOrg = await iRecClient.getRegistrations();
                if (iRecOrg?.length) {
                    setValues(iRecOrg[0]);
                }
            }
        };
        getIRecOrganization();
    }, [params]);

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
                        label="I-REC Account Type"
                        className="mt-3"
                        value={formValues.accountType}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Organization Headquarters Country"
                        className="mt-3"
                        value={formValues.headquarterCountry}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Year of Registration"
                        value={formValues.registrationYear}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Number of Employees"
                        className="mt-3"
                        value={formValues.employeesNumber}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Shareholder Names with more than 10%"
                        className="mt-3"
                        value={formValues.shareholders}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Website"
                        className="mt-3"
                        value={formValues.website}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Active Countries"
                        value={formValues.activeCountries}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Main Business"
                        value={formValues.mainBusiness}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Name of Chief Executive Officer/General Manager"
                        value={formValues.ceoName}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Chief Executive Officer/General Manager passport number"
                        value={formValues.ceoPassportNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Balance sheet total for last financial year"
                        value={formValues.balanceSheetTotal}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    {formValues.subsidiaries && (
                        <TextField
                            label="Existing I-REC Registry organization(s) to become subsidiary"
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
