import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    OriginFeature,
    Countries,
    IRECBusinessLegalStatusLabelsMap
} from '@energyweb/utils-general';
import { makeStyles, createStyles, useTheme, Paper, Grid, TextField, Box } from '@material-ui/core';
import { getIRecClient, getBackendClient } from '../../features/general';
import { getUserOffchain } from '../../features/users';
import { Registration } from '../../utils/irec';
import { OriginConfigurationContext } from '../../PackageConfigurationProvider';
import { Download } from '../Documents';
import { IRECOrganizationView } from './IRec/IRECOrganizationView';

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
    status: string;
    signatoryDocumentIds?: string[];
    documentIds?: string[];
}

const useStyles = makeStyles(() =>
    createStyles({
        container: {
            padding: '20px',
            marginBottom: '20px'
        }
    })
);

export function OrganizationView() {
    const userOffchain = useSelector(getUserOffchain);
    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const params: { id?: string } = useParams();
    const { enabledFeatures } = useContext(OriginConfigurationContext);
    const [formValues, setFormValues] = useState<IFormValues>(null);
    const [iRecData, setIRecData] = useState<Registration>(null);
    const iRecClient = useSelector(getIRecClient);

    const { t } = useTranslation();
    const classes = useStyles(useTheme());

    const setBusinessType = (type: string) => {
        if (parseInt(type, 10)) {
            return IRECBusinessLegalStatusLabelsMap[type];
        } else {
            return type;
        }
    };

    const setValues = (organization) => {
        setFormValues({
            ...organization,
            businessType: setBusinessType(organization.businessType),
            country: Countries.find((c) => c.code === organization.country).name,
            signatoryCountry: Countries.find((c) => c.code === organization.signatoryCountry).name,
            status: organization.status.toLowerCase()
        });
    };

    useEffect(() => {
        const getOrganization = async () => {
            let iRecOrg: Registration[];
            if (enabledFeatures.includes(OriginFeature.IRec)) {
                const response = await iRecClient.organizationClient.getRegistrations();
                iRecOrg = response.data;
            }
            const organization = params.id
                ? (await organizationClient.get(parseInt(params.id, 10))).data
                : userOffchain?.organization;
            if (organization) {
                setValues(organization);

                if (enabledFeatures.includes(OriginFeature.IRec)) {
                    const owner = params.id ? parseInt(params.id, 10) : organization.id;
                    setIRecData(iRecOrg?.filter((org) => parseInt(org.owner, 10) === owner)[0]);
                }
            }
        };
        getOrganization();
    }, [params]);

    if (!formValues) {
        return <></>;
    }

    return (
        <>
            <Paper className={classes.container}>
                <Grid item>
                    <Box style={{ textTransform: 'uppercase' }}>
                        {t('organization.registration.organizationInformation')}
                    </Box>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField
                            data-cy="organization-name"
                            label={t('organization.registration.organizationName')}
                            className="mt-3"
                            value={formValues.name}
                            fullWidth
                            disabled
                        />

                        <TextField
                            data-cy="organization-address"
                            label={t('organization.registration.organizationAddress')}
                            className="mt-3"
                            value={formValues.address}
                            fullWidth
                            disabled
                        />

                        <TextField
                            data-cy="organization-business-type"
                            label={t('organization.registration.businessType')}
                            className="mt-3"
                            value={formValues.businessType}
                            fullWidth
                            disabled
                        />

                        <TextField
                            data-cy="organization-trade-registry"
                            label={t('organization.registration.tradeRegistryNumber')}
                            className="mt-3"
                            value={formValues.tradeRegistryCompanyNumber}
                            fullWidth
                            disabled
                        />

                        <TextField
                            data-cy="organization-vat-number"
                            label={t('organization.registration.vatNumber')}
                            value={formValues.vatNumber}
                            disabled
                            className="mt-3"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            data-cy="organization-signatory-name"
                            label={t('organization.registration.signatoryName')}
                            value={formValues.signatoryFullName}
                            disabled
                            className="mt-3"
                            fullWidth
                        />

                        <TextField
                            data-cy="organization-signatory-address"
                            label={t('organization.registration.signatoryAddress')}
                            value={formValues.signatoryAddress}
                            disabled
                            className="mt-3"
                            fullWidth
                        />

                        <TextField
                            data-cy="organization-signatory-email"
                            label={t('organization.registration.signatoryEmail')}
                            value={formValues.signatoryEmail}
                            disabled
                            className="mt-3"
                            fullWidth
                        />

                        <TextField
                            data-cy="organization-signatory-phone"
                            label={t('organization.registration.signatoryTelephone')}
                            value={formValues.signatoryPhoneNumber}
                            disabled
                            className="mt-3"
                            fullWidth
                        />
                        <TextField
                            data-cy="organization-signatory-status"
                            label={t('organization.registration.organizationStatus.status')}
                            value={t(
                                `organization.registration.organizationStatus.${formValues.status}`
                            )}
                            disabled
                            className="mt-3"
                            fullWidth
                        />
                    </Grid>
                </Grid>
                {formValues.documentIds?.length || formValues.signatoryDocumentIds?.length ? (
                    <Grid item>
                        <Box style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {t('organization.registration.documents')}
                        </Box>
                    </Grid>
                ) : null}

                {formValues.documentIds && (
                    <Download
                        data-cy="company-proof-doc"
                        documents={formValues.documentIds}
                        name={t('organization.registration.companyProof')}
                    />
                )}

                {formValues.signatoryDocumentIds && (
                    <Download
                        data-cy="signatory-id-doc"
                        documents={formValues.signatoryDocumentIds}
                        name={t('organization.registration.signatoryId')}
                    />
                )}
            </Paper>
            {enabledFeatures.includes(OriginFeature.IRec) && (
                <IRECOrganizationView iRecOrg={iRecData} />
            )}
        </>
    );
}
