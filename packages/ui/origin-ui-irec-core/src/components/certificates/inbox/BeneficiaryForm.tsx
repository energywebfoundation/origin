import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@material-ui/core';
import { Countries } from '@energyweb/utils-general';

export interface IBeneficiaryFormData {
    beneficiary: string;
    address: string;
    zipCode: string;
    region: string;
    countryCode: string;
}

export function BeneficiaryForm(props: {
    data: IBeneficiaryFormData;
    setData: (data: IBeneficiaryFormData) => void;
}): JSX.Element {
    const { data, setData } = props;

    const { t } = useTranslation();

    const countryCodes = Countries.map((country) => country.code);

    function setField(key: string, value: string) {
        setData({
            ...data,
            [key]: value
        });
    }

    return (
        <>
            <TextField
                label={t('certificate.properties.beneficiary')}
                value={data.beneficiary ?? ''}
                onChange={(e) => setField('beneficiary', e.target.value as string)}
                className="mt-4"
                fullWidth
            />
            <TextField
                label={t('certificate.properties.address')}
                value={data.address ?? ''}
                onChange={(e) => setField('address', e.target.value as string)}
                className="mt-4"
                fullWidth
            />

            <div style={{ display: 'flex' }}>
                <TextField
                    label={t('certificate.properties.region')}
                    value={data.region ?? ''}
                    onChange={(e) => setField('region', e.target.value as string)}
                    className="mt-4 mr-1"
                    style={{ width: '50%' }}
                />
                <TextField
                    label={t('certificate.properties.zip')}
                    value={data.zipCode ?? ''}
                    onChange={(e) => setField('zipCode', e.target.value as string)}
                    className="mt-4 ml-2"
                    style={{ width: '50%' }}
                />
            </div>

            <FormControl fullWidth={true} variant="filled" className="mt-4">
                <InputLabel>{t('certificate.properties.country')}</InputLabel>
                <Select
                    value={data.countryCode ?? countryCodes[0]}
                    onChange={(e) => setField('countryCode', e.target.value as string)}
                    fullWidth
                    variant="filled"
                    input={<FilledInput />}
                >
                    {countryCodes?.map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
}
