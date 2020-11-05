import React from 'react';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from './MultiSelectAutocomplete';
import { Countries } from '@energyweb/utils-general';

interface IProps {
    label: string;
    selectedValues: IAutocompleteMultiSelectOptionType[];
    onChange: (value: IAutocompleteMultiSelectOptionType[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    isoFormat?: boolean;
    max?: number;
}

const COUNTRY_OPTIONS = Countries.map((country) => ({
    value: country.id.toString(),
    label: country.name,
    code: country.code
}));

export function FormCountryMultiSelect(props: IProps) {
    const { className, label, placeholder, onChange, selectedValues, disabled, max } = props;

    return (
        <div className={className}>
            <MultiSelectAutocomplete
                label={label}
                placeholder={placeholder}
                options={COUNTRY_OPTIONS}
                onChange={(value: IAutocompleteMultiSelectOptionType[]) => onChange(value || [])}
                selectedValues={selectedValues}
                className="mt-3"
                disabled={disabled}
                max={max}
            />
        </div>
    );
}
