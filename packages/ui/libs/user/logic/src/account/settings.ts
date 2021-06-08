import { SupportedLanguagesEnum } from '@energyweb/origin-ui-localization';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

const prepareLanguageOptions = (t: TFunction) => {
  const supportedLanugages = Object.keys(SupportedLanguagesEnum);

  return supportedLanugages.map((language) => ({
    label: t(`user.settings.languages.${language}`),
    value: language,
  }));
};

export const useSettingsPageLogic = () => {
  const { t } = useTranslation();

  return {
    notificationsLabel: t('user.settings.notifications'),
    languageLabel: t('user.settings.language'),
    languageOptions: prepareLanguageOptions(t),
    buttonText: t('general.buttons.update'),
  };
};
