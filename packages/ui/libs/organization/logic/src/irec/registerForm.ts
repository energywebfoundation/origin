import { useTranslation } from 'react-i18next';
import { createLeadUserDetailsForm } from './leadUserDetails';
import { createPrimaryContactDetailsForm } from './primaryContactDetails';
import { createIRecRegistrationInfoForm } from './registrationInfo';
import { TUseRegisterIRecFormLogic } from './types';

export const useRegisterIRecFormLogic: TUseRegisterIRecFormLogic = () => {
  const { t } = useTranslation();
  return {
    heading: t('organization.registerIRec.registerOrgInIRec'),
    forms: [
      createIRecRegistrationInfoForm(t),
      createPrimaryContactDetailsForm(t),
      createLeadUserDetailsForm(t),
    ],
    backButtonText: t('general.buttons.back'),
  };
};
