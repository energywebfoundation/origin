import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Grid, InputAdornment, Divider } from '@material-ui/core';
import {
    useValidation,
    useTranslation,
    getUserOffchain,
    LightenColor
} from '@energyweb/origin-ui-core';
import { FormInput, FormikDatePickerWithMonthArrowsFilled } from '../Form';
import { useOriginConfiguration } from '../../utils/configuration';

export const OneTimePurchase = (props) => {
    const { fieldDisabled, currency, setFieldValue, energyUnit, setValidationSchema } = props;
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const user = useSelector(getUserOffchain);
    const originConfiguration = useOriginConfiguration();
    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorLighten = LightenColor(originBgColor, 5);

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
            <Divider variant="fullWidth" style={{ backgroundColor: bgColorLighten }} />
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormInput
                        label={t('exchange.properties.energy')}
                        property="energy"
                        disabled={!user || fieldDisabled}
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
                        disabled={!user || fieldDisabled}
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
