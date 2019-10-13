import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';
import Select from 'react-select';
import { BaseTextFieldProps } from '@material-ui/core/TextField';
import {
    useTheme,
    makeStyles,
    Typography,
    TextField,
    Paper,
    Chip,
    MenuItem
} from '@material-ui/core';

import CancelIcon from '@material-ui/icons/Cancel';
import { ValueContainerProps } from 'react-select/src/components/containers';
import { ControlProps } from 'react-select/src/components/Control';
import { MenuProps, NoticeProps } from 'react-select/src/components/Menu';
import { MultiValueProps } from 'react-select/src/components/MultiValue';
import { OptionProps } from 'react-select/src/components/Option';
import { PlaceholderProps } from 'react-select/src/components/Placeholder';
import { SingleValueProps } from 'react-select/src/components/SingleValue';
import { ValueType } from 'react-select/src/types';
import { Omit } from '@material-ui/types';
import {
    INPUT_AUTOCOMPLETE_SELECT_STYLE,
    createInputAutocompleteStyle
} from '../styles/styleConfig';

export interface IAutocompleteMultiSelectOptionType {
    label: string;
    value: string;
}

function NoOptionsMessage(props: NoticeProps<IAutocompleteMultiSelectOptionType>) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

type InputComponentProps = Pick<BaseTextFieldProps, 'inputRef'> & HTMLAttributes<HTMLDivElement>;

function inputComponent({ inputRef, ...props }: InputComponentProps) {
    return <div ref={inputRef} {...props} />;
}

function Control(props: ControlProps<IAutocompleteMultiSelectOptionType>) {
    const {
        children,
        innerProps,
        innerRef,
        selectProps: { classes, TextFieldProps }
    } = props;

    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: classes.input,
                    ref: innerRef,
                    children,
                    ...innerProps
                }
            }}
            {...TextFieldProps}
        />
    );
}

function Option(props: OptionProps<IAutocompleteMultiSelectOptionType>) {
    return (
        <MenuItem
            ref={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

type MuiPlaceholderProps = Omit<
    PlaceholderProps<IAutocompleteMultiSelectOptionType>,
    'innerProps'
> &
    Partial<Pick<PlaceholderProps<IAutocompleteMultiSelectOptionType>, 'innerProps'>>;
function Placeholder(props: MuiPlaceholderProps) {
    const { selectProps, innerProps = {}, children } = props;
    return (
        <Typography
            color="textSecondary"
            className={selectProps.classes.placeholder}
            {...innerProps}
        >
            {children}
        </Typography>
    );
}

function SingleValue(props: SingleValueProps<IAutocompleteMultiSelectOptionType>) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props: ValueContainerProps<IAutocompleteMultiSelectOptionType>) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props: MultiValueProps<IAutocompleteMultiSelectOptionType>) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={clsx(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
            color="primary"
        />
    );
}

function Menu(props: MenuProps<IAutocompleteMultiSelectOptionType>) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer
};

interface IOwnProps {
    classes: any;
    label: string;
    placeholder: string;
    options: IAutocompleteMultiSelectOptionType[];
    onChange: (value: ValueType<IAutocompleteMultiSelectOptionType>) => any;
    selectedValues: ValueType<IAutocompleteMultiSelectOptionType>;
    disabled?: boolean;
}

export function MultiSelectAutocomplete(props: IOwnProps) {
    function handleMultiSelectChange(value: ValueType<IAutocompleteMultiSelectOptionType>) {
        props.onChange(value);
    }

    const useStyles = makeStyles(createInputAutocompleteStyle);

    const classes = useStyles(useTheme());
    const { label, placeholder, options, selectedValues, disabled } = props;

    return (
        <div className={classes.root}>
            <Select
                classes={classes}
                styles={INPUT_AUTOCOMPLETE_SELECT_STYLE}
                TextFieldProps={{
                    label,
                    InputLabelProps: {
                        shrink: true
                    }
                }}
                placeholder={placeholder}
                options={options}
                components={components}
                value={selectedValues}
                onChange={handleMultiSelectChange}
                isDisabled={disabled}
                isMulti
            />
        </div>
    );
}
