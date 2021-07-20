import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@material-ui/core';
import { MaterialDatePicker, getCountryName } from '@energyweb/origin-ui-core';
import { Countries } from '@energyweb/utils-general';
import { IClaimData } from '@energyweb/issuer';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    beneficiary: Yup.string().required().label('Beneficiary'),
    address: Yup.string().required().label('Address'),
    zipCode: Yup.string().required().label('Beneficiary')
});

interface IProps {
    data: IClaimData;
    setData: (data: IClaimData) => void;
    disabled: boolean;
    setDisabled: (value: boolean) => void;
}

export function BeneficiaryForm(props: IProps): JSX.Element {
    const { data, setData, disabled, setDisabled } = props;

    const { t } = useTranslation();

    const { register, formState } = useForm({
        mode: 'onBlur',
        resolver: yupResolver(validationSchema),
        defaultValues: data
    });
    const { isValid, errors } = formState;

    useEffect(() => {
        if (!isValid !== disabled) {
            setDisabled(!isValid);
        }
    }, [isValid]);

    const countryCodes = Countries.map((country) => country.code);

    function setField(key: string, value: string) {
        setData({
            ...data,
            [key]: value
        });
    }

    return (
        <>
            <form>
                <TextField
                    label={t('certificate.properties.beneficiary')}
                    value={data.beneficiary ?? ''}
                    name="beneficiary"
                    error={Boolean(errors.beneficiary)}
                    helperText={errors.beneficiary?.message}
                    inputRef={register}
                    onChange={(e) => setField('beneficiary', e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />
                <TextField
                    label={t('certificate.properties.location')}
                    value={data.location ?? ''}
                    name="location"
                    error={Boolean(errors.location)}
                    helperText={errors.location?.message}
                    inputRef={register}
                    onChange={(e) => setField('location', e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />

                <div style={{ display: 'flex' }}>
                    <MaterialDatePicker
                        label="Period start date"
                        value={data.periodStartDate ?? ''}
                        onChange={(date) => setField('periodStartDate', date.toISOString())}
                        className="mt-4 mr-1"
                        style={{ width: '50%' }}
                    />
                    <MaterialDatePicker
                        label="Period end date"
                        value={data.periodEndDate ?? ''}
                        onChange={(date) => setField('periodEndDate', date.toISOString())}
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
                                {getCountryName(item)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </form>
        </>
    );
}
