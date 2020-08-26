import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { makeStyles, createStyles, useTheme, Paper, Grid, TextField } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Countries } from '@energyweb/utils-general';
import { getUserOffchain } from '../../features/users/selectors';
import { getOffChainDataSource } from '../../features/general/selectors';

interface IFormValues {
    code: string;
    name: string;
    contact: string;
    telephone: string;
    email: string;
    address: string;
    shareholders: string;
    ceoPassportNumber: string;
    ceoName: string;
    companyNumber: string;
    vatNumber: string;
    postcode: string;
    headquartersCountry: string;
    country: string;
    businessTypeSelect: string;
    businessTypeInput: string;
    yearOfRegistration: number | '';
    numberOfEmployees: number | '';
    website: string;
    activeCountries: string;
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

    const setValues = (organization, activeCountriesParsed) => {
        setFormValues({
            ...organization,
            headquartersCountry: Countries.find((c) => c.id === organization.headquartersCountry)
                .name,
            activeCountries: Countries.filter((c) => activeCountriesParsed.includes(c.id))
                .map((country) => country.name)
                .join(', '),
            country: Countries.find((c) => c.id === organization.country).name
        });
    };

    useEffect(() => {
        const getOrganization = async () => {
            const organization = params.id
                ? await organizationClient.getById(parseInt(params.id, 10))
                : userOffchain?.organization;
            if (organization) {
                const activeCountriesParsed: number[] = JSON.parse(organization.activeCountries);
                setValues(organization, activeCountriesParsed);
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
                        label="Code"
                        className="mt-3"
                        value={formValues.code}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Name"
                        className="mt-3"
                        value={formValues.name}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Headquarters Country"
                        value={formValues.headquartersCountry}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Contact"
                        className="mt-3"
                        value={formValues.contact}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Email"
                        className="mt-3"
                        value={formValues.email}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Telephone"
                        className="mt-3"
                        value={formValues.telephone}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Company number"
                        value={formValues.companyNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="VAT number"
                        value={formValues.vatNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="CEO name"
                        value={formValues.ceoName}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="CEO passport number"
                        value={formValues.ceoPassportNumber}
                        disabled
                        className="mt-3"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Business type"
                        value={formValues.businessTypeSelect}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Year of registration"
                        value={formValues.yearOfRegistration}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Approximate number of employees"
                        value={formValues.numberOfEmployees}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Shareholders"
                        value={formValues.shareholders}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Website"
                        value={formValues.website}
                        className="mt-3"
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Active countries"
                        value={formValues.activeCountries}
                        className="mt-3"
                        required
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Address"
                        value={formValues.address}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Postcode"
                        value={formValues.postcode}
                        disabled
                        className="mt-3"
                        fullWidth
                    />

                    <TextField
                        label="Country"
                        value={formValues.country}
                        disabled
                        className="mt-3"
                        fullWidth
                    />
                </Grid>
            </Grid>{' '}
        </Paper>
    );
}
