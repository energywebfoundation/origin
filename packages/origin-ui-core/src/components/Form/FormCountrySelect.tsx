import React from 'react';
import { FormSelect } from './FormSelect';
import { Countries } from '@energyweb/utils-general';

interface IFormCountrySelectProps {
    label: string;
    property: string;
    currentValue: string | number;
    className?: string;
    required?: boolean;
    disabled?: boolean;
}

const COUNTRY_OPTIONS_ISO = Countries.map((country) => ({
    value: country.code,
    label: country.name,
    code: country.code
}));

export function FormCountrySelect(props: IFormCountrySelectProps) {
    return <FormSelect options={COUNTRY_OPTIONS_ISO} {...props} />;
}
