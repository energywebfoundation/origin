import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import { orgInfoForm } from './orgInfoForm';
import { signatoryInfoForm } from './signatoryInfoForm';

export const registerOrganizationForm: MultiStepFormItem[] = [
  orgInfoForm,
  signatoryInfoForm,
];
