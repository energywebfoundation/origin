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
    isoFormat?: boolean;
}

const COUNTRY_OPTIONS = Countries.map((country) => ({
    value: country.id,
    label: country.name
}));

const COUNTRY_OPTIONS_ISO = Countries.map((country) => ({
    value: country.id,
    label: country.name,
    code: country.code
}));

export function FormCountrySelect(props: IFormCountrySelectProps) {
    return (
        <FormSelect options={props.isoFormat ? COUNTRY_OPTIONS_ISO : COUNTRY_OPTIONS} {...props} />
    );
}
