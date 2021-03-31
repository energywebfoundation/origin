import { useValidation } from '../../../../../utils';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { yupToFormErrors } from 'formik';
import { ValidationHandlerReturnType } from '../types';

export const useBlockchainAdressFormValidationHandler = (): ValidationHandlerReturnType => {
    const { Yup } = useValidation();
    const { t } = useTranslation();
    const VALIDATION_SCHEMA = Yup.object().shape({
        blockchainAccountAddress: Yup.string()
            .label(t('user.properties.blockchainAddress'))
            .required()
    });

    return useCallback(async (values) => {
        try {
            await VALIDATION_SCHEMA.validateSync(values, {
                abortEarly: false
            });
            return {};
        } catch (err) {
            return yupToFormErrors(err);
        }
    }, []);
};
