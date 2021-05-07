import { TUseRegisterOrganizationFormLogic } from './types';
import { createOrgInfoForm } from './orgInfoForm';
import { createSignatoryInfoForm } from './signatoryInfoForm';

export const useRegisterOrganizationFormLogic: TUseRegisterOrganizationFormLogic = (
  t
) => {
  return [createOrgInfoForm(t), createSignatoryInfoForm(t)];
};
