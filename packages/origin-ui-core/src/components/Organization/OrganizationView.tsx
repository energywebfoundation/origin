import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { makeStyles, createStyles, useTheme, Paper, Grid, TextField } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Countries } from '@energyweb/utils-general';
import { getUserOffchain } from '../../features/users/selectors';
import { getOffChainDataSource } from '../../features/general/selectors';

interface IFormValues {
    name: string;
    address: string;
    businessType: string;
    city: string;
    zipCode: string;
    country: number;
    tradeRegistryCompanyNumber: string;
    vatNumber: string;
    signatoryAddress: string;
    signatoryCity: string;
    signatoryCountry: number;
    signatoryEmail: string;
    signatoryFullName: string;
    signatoryPhoneNumber: string;
    signatoryZipCode: string;
}

export function OrganizationView() {
    const userOffchain = useSelector(getUserOffchain);
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const params: { id?: string } = useParams();
    const [formValues, setFormValues] = useState<IFormValues>(null);

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const setValues = (organization) => {
        setFormValues({
            ...organization,
            country: Countries.find((c) => c.id === organization.country).name,
            signatoryCountry: Countries.find((c) => c.id === organization.signatoryCountry).name
        });
    };

    useEffect(() => {
        const getOrganization = async () => {
            const organization = params.id
                ? await organizationClient.getById(parseInt(params.id, 10))
                : userOffchain?.organization;
            if (organization) {
                setValues(organization);
            }
        };
        getOrganization();
    }, [params]);

    if (!formValues) {
        return <Skeleton variant="rect" height={200} />;
    }

    return (
        <Paper className={classes.container}>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        label="Organization Name"
                        className="mt-3"
                        value={formValues.name}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Organization Address"
                        className="mt-3"
                        value={formValues.address}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Zip Code"
                        value={formValues.zipCode}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Country"
                        className="mt-3"
                        value={formValues.country}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Business Type"
                        className="mt-3"
                        value={formValues.businessType}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Trade Registry Company Number"
                        className="mt-3"
                        value={formValues.tradeRegistryCompanyNumber}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="VAT number"
                        value={formValues.vatNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Full Name"
                        value={formValues.signatoryFullName}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Address"
                        value={formValues.signatoryAddress}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Zip Code"
                        value={formValues.signatoryZipCode}
                        disabled
                        className="mt-3"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Signatory City"
                        value={formValues.signatoryCity}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Country"
                        value={formValues.signatoryCountry}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Email"
                        value={formValues.signatoryEmail}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Signatory Telephone"
                        value={formValues.signatoryPhoneNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />
                </Grid>
            </Grid>
        </Paper>
    );
}
