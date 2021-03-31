import React from 'react';
import { Countries } from '@energyweb/utils-general';
import { SelectAutocomplete } from './SelectAutocomplete';

interface IFormCountrySelectProps {
    label: string;
    currentValue: string | number;
    onChange: (value: string) => void;
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
    return (
        <div className={props.className}>
            <SelectAutocomplete {...props} options={COUNTRY_OPTIONS_ISO} />
        </div>
    );
}
