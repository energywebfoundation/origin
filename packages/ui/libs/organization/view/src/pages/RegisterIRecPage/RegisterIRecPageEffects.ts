import { useIRecRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { createRegisterIRecFormLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';

export const useRegisterIRecPageEffects = () => {
  const { t } = useTranslation();
  const multiStepFormLogic = createRegisterIRecFormLogic(t);
  const submitHandler = useIRecRegisterHandler();

  const formData = {
    ...multiStepFormLogic,
    submitHandler,
  };

  return { formData };
};
