import * as Yup from 'yup';

import { useState, useEffect } from 'react';
import { getI18n, useTranslation } from 'react-i18next';
import { setYupLanguage } from './yup/setYupLanguage';

setYupLanguage(getI18n().t);

export const useValidation = () => {
  const { t } = useTranslation();
  const [yupLocaleInitialized, setYupLocaleInitialized] = useState(false);

  useEffect(() => {
    if (!t || yupLocaleInitialized) {
      return;
    }
  }, [t, yupLocaleInitialized]);

  return { Yup, yupLocaleInitialized };
};
