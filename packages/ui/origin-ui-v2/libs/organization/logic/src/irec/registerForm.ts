import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import { leadUserDetals } from './leadUserDetails';
import { primaryContactDetails } from './primaryContactDetails';
import { orgInfoForm } from './registrationInfo';

export const registerIRecForm: MultiStepFormItem[] = [
  orgInfoForm,
  primaryContactDetails,
  leadUserDetals,
];
