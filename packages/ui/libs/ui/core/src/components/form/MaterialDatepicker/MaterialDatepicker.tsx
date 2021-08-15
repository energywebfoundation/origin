import React, { FC } from 'react';
import { DateFormatEnum } from '@energyweb/origin-ui-utils';
import { Box, TextField, TextFieldProps } from '@material-ui/core';
import { DatePicker, LocalizationProvider } from '@material-ui/lab';
import AdapterDayJs from '@material-ui/lab/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { GenericFormField } from '../../../containers';
import { ClearButton } from '../../buttons';
import { useStyles } from './MaterialDatepicker.styles';
import { useMaterialDatepickerEffects } from './MaterialDatepicker.effects';

export interface MaterialDatepickerProps<FormValuesType = any> {
  value: any;
  onChange: (event: Dayjs) => void;
  field: GenericFormField<FormValuesType>;
  disabled?: boolean;
  errorExists?: boolean;
  errorText?: string;
  variant?: TextFieldProps['variant'];
}

export const MaterialDatepicker: FC<MaterialDatepickerProps> = ({
  value,
  onChange,
  disabled,
  errorExists,
  errorText,
  variant,
  field,
}) => {
  const classes = useStyles();
  const {
    open,
    clearValue,
    handlePickerOpen,
    handlePickerClose,
    adornmentPosition,
  } = useMaterialDatepickerEffects({ onChange });

  return (
    <LocalizationProvider dateAdapter={AdapterDayJs}>
      <DatePicker
        clearable
        reduceAnimations
        disableMaskedInput
        showToolbar={false}
        open={open}
        disabled={disabled}
        onChange={onChange}
        value={value}
        className={classes.root}
        inputFormat={DateFormatEnum.DATE_FORMAT_MDY}
        onClose={handlePickerClose}
        InputProps={{
          onClick: handlePickerOpen,
          classes: {
            root: classes.input,
          },
          endAdornment: (
            <Box className={classes.clearButtonWrapper}>
              {value && (
                <ClearButton
                  onClick={clearValue}
                  className={classes.clearButton}
                />
              )}
            </Box>
          ),
        }}
        PopperProps={{
          className: classes.popper,
        }}
        DialogProps={{
          className: classes.dialog,
        }}
        InputAdornmentProps={{
          position: adornmentPosition,
        }}
        renderInput={(props) => (
          <TextField
            {...props}
            fullWidth
            margin="normal"
            error={errorExists ?? false}
            helperText={errorText ?? ''}
            variant={variant}
            label={field.label}
            required={field.required}
            {...field.textFieldProps}
          />
        )}
      />
    </LocalizationProvider>
  );
};
