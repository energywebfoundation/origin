import React, { useEffect } from 'react';
import { Grid, InputAdornment, Divider } from '@material-ui/core';
import { useValidation, useTranslation } from '../../utils';
import { FormInput, FormikDatePickerWithMonthArrowsFilled } from '../Form';

export const OneTimePurchase = (props) => {
    const { fieldDisabled, currency, setFieldValue, energyUnit, setValidationSchema } = props;
    const { t } = useTranslation();
    const { Yup } = useValidation();

    const VALIDATION_SCHEMA = Yup.object().shape({
        generationDateStart: Yup.date().label(t('exchange.properties.generationDateStart')),
        generationDateEnd: Yup.date().label(t('exchange.properties.generationDateEnd')),
        energy: Yup.number().positive().integer().label(t('exchange.properties.energy')),
        price: Yup.number().positive().min(0.01).label(t('exchange.properties.price'))
    });

    useEffect(() => {
        setValidationSchema(VALIDATION_SCHEMA);
    }, []);

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormikDatePickerWithMonthArrowsFilled
                        name="generationDateStart"
                        label={t('exchange.properties.generationDateStart')}
                        disabled={fieldDisabled}
                        required={false}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormikDatePickerWithMonthArrowsFilled
                        name="generationDateEnd"
                        label={t('exchange.properties.generationDateEnd')}
                        disabled={fieldDisabled}
                        required={false}
                    />
                </Grid>
            </Grid>
            <br />
            <Divider variant="fullWidth" className="divider" />
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.energy')}
                        property="energy"
                        disabled={fieldDisabled}
                        className="mt-3"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">{energyUnit}</InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.price')}
                        property="price"
                        disabled={fieldDisabled}
                        className="mt-3"
                        required
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{currency}</InputAdornment>
                        }}
                        wrapperProps={{
                            onBlur: (e) => {
                                const parsedValue = parseFloat((e.target as any)?.value);

                                if (!isNaN(parsedValue) && parsedValue > 0) {
                                    setFieldValue('price', parsedValue.toFixed(2));
                                }
                            }
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
};
