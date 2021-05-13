import { createLeadUserDetailsForm } from './leadUserDetails';
import { createPrimaryContactDetailsForm } from './primaryContactDetails';
import { createIRecRegistrationInfoForm } from './registrationInfo';
import { TCreateRegisterIRecFormLogic } from './types';

export const createRegisterIRecFormLogic: TCreateRegisterIRecFormLogic = (
  t
) => {
  return {
    heading: t('organization.registerIRec.registerOrgInIRec'),
    forms: [
      createIRecRegistrationInfoForm(t),
      createPrimaryContactDetailsForm(t),
      createLeadUserDetailsForm(t),
    ],
  };
};
