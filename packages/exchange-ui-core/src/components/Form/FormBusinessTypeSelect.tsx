import React from 'react';
import { FormSelect } from './FormSelect';
import {
    IRECBusinessLegalStatus,
    IRECBusinessLegalStatusLabelsMap
} from '@energyweb/utils-general';
import { FormInput } from './FormInput';

interface IProps {
    label: string;
    selectProperty: string;
    selectCurrentValue: string;
    inputProperty: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
}

const BUSINESS_LEGAL_TYPE_OPTIONS = [
    ...Object.keys(IRECBusinessLegalStatus)
        .filter((k) => !isNaN(Number(k)))
        .map((item) => ({
            value: item,
            label: IRECBusinessLegalStatusLabelsMap[item]
        })),
    {
        value: 'Other',
        label: 'Other'
    }
];

export function FormBusinessTypeSelect(props: IProps) {
    const {
        inputProperty,
        label,
        selectCurrentValue,
        selectProperty,
        className,
        disabled,
        required
    } = props;

    return (
        <>
            <FormSelect
                options={BUSINESS_LEGAL_TYPE_OPTIONS}
                property={selectProperty}
                currentValue={selectCurrentValue}
                label={label}
                className={className}
                required={required}
                disabled={disabled}
            />
            {selectCurrentValue === 'Other' && (
                <FormInput
                    property={inputProperty}
                    label={label}
                    className={className}
                    required={required}
                    disabled={disabled}
                />
            )}
        </>
    );
}
