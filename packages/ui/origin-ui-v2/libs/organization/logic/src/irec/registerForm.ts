import { createLeadUserDetailsForm } from './leadUserDetails';
import { createPrimaryContactDetailsForm } from './primaryContactDetails';
import { createIRecRegistrationInfoForm } from './registrationInfo';
import { TUseRegisterIRecFormLogic } from './types';

export const useRegisterIRecFormLogic: TUseRegisterIRecFormLogic = (t) => {
  return [
    createIRecRegistrationInfoForm(t),
    createPrimaryContactDetailsForm(t),
    createLeadUserDetailsForm(t),
  ];
};
