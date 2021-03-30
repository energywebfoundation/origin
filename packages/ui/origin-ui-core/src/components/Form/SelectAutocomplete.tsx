import React, { useState, useEffect } from 'react';
import { TextField, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { useOriginConfiguration } from '../../utils/configuration';
import { IAutocompleteMultiSelectOptionType } from './MultiSelectAutocomplete';

interface IOwnProps {
    label: string;
    placeholder?: string;
    options: IAutocompleteMultiSelectOptionType[];
    onChange: (value: string) => void;
    currentValue: string | number;
    disabled?: boolean;
    className?: string;
    max?: number;
    required?: boolean;
    singleChoice?: boolean;
}

export function SelectAutocomplete(props: IOwnProps) {
    const {
        label,
        placeholder,
        options,
        currentValue,
        disabled,
        className,
        required,
        ...otherProps
    } = props;

    const { styleConfig } = useOriginConfiguration();

    const useStyles = makeStyles(() =>
        createStyles({
            clearIndicator: {
                color: styleConfig.FIELD_ICON_COLOR
            },
            popupIndicator: {
                color: styleConfig.FIELD_ICON_COLOR
            }
        })
    );

    const classes = useStyles(useTheme());
    const [touchFlag, setTouchFlag] = useState<boolean>(null);
    const [textValue, setTextValue] = useState<string>('');
    const [requiredState, setRequiredState] = useState<boolean>(null);

    useEffect(() => {
        setRequiredState(required);
    }, [required]);

    useEffect(() => {
        if (currentValue !== null) {
            setRequiredState(false);
        } else {
            setRequiredState(required);
        }
    }, [currentValue]);

    return (
        <Autocomplete
            filterSelectedOptions
            options={options}
            inputValue={textValue}
            getOptionLabel={(option) => option.label}
            onChange={(event, value: IAutocompleteMultiSelectOptionType) => {
                props.onChange(value?.value ?? null);
                setTouchFlag(true);
                setTextValue(value?.label ?? '');
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    required={requiredState}
                    label={label}
                    onChange={(event) => setTextValue(event.target.value)}
                    onBlur={() => {
                        if (props.currentValue === null) {
                            setTextValue('');
                        } else {
                            const current = options.find((o) => o.value === props.currentValue);
                            setTextValue(current.label);
                        }
                    }}
                    helperText={
                        touchFlag && requiredState && currentValue !== null
                            ? label + ' is a required field'
                            : ''
                    }
                    inputProps={{ ...params.inputProps }}
                    error={touchFlag && requiredState && currentValue !== null}
                    placeholder={touchFlag ? '' : placeholder}
                    fullWidth
                    variant="filled"
                />
            )}
            getOptionSelected={(option, value) => option.value === value.value}
            getOptionDisabled={() => disabled}
            disabled={disabled}
            classes={classes}
        />
    );
}
