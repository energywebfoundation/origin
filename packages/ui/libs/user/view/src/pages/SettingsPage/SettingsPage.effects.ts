import {
  getOriginLanguage,
  setOriginLanguage,
} from '@energyweb/origin-ui-shared-state';
import { useSettingsPageLogic } from '@energyweb/origin-ui-user-logic';
import { ChangeEvent, useState } from 'react';

export const useSettingsPageEffects = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [language, setLanguage] = useState(getOriginLanguage());

  const handleNotificationsChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setNotificationsEnabled(checked);
  };

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  const handleUpdateLanguage = () => {
    setOriginLanguage(language);
    window.location.reload();
  };

  const pageLogic = useSettingsPageLogic();

  return {
    notificationsEnabled,
    language,
    handleNotificationsChange,
    handleLanguageChange,
    handleUpdateLanguage,
    ...pageLogic,
  };
};
