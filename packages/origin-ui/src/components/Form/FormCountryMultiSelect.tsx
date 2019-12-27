import React from 'react';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from '../MultiSelectAutocomplete';
import { Countries } from '@energyweb/utils-general';

export interface IFormCountryMultiSelectOption {
    label: string;
    value: number;
}

interface IProps {
    label: string;
    selectedValues: IFormCountryMultiSelectOption[];
    onChange: (value: IFormCountryMultiSelectOption[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const COUNTRY_OPTIONS = Countries.map(country => ({
    value: country.id.toString(),
    label: country.name
}));

export function FormCountryMultiSelect(props: IProps) {
    const { className, label, placeholder, onChange, selectedValues, disabled } = props;

    return (
        <div className={className}>
            <MultiSelectAutocomplete
                label={label}
                placeholder={placeholder}
                options={COUNTRY_OPTIONS}
                onChange={(value: IAutocompleteMultiSelectOptionType[]) =>
                    onChange(
                        value.map(i => ({
                            ...i,
                            value: Number(i.value)
                        }))
                    )
                }
                selectedValues={selectedValues.map(i => ({
                    ...i,
                    value: i.value.toString()
                }))}
                classes={{ root: 'mt-3' }}
                disabled={disabled}
            />
        </div>
    );
}
