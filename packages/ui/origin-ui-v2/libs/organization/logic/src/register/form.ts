import { MultiStepFormProps } from '@energyweb/origin-ui-core';
import { orgInfoForm } from './orgInfoForm';
import { signatoryInfoForm } from './signatoryInfoForm';
import { FormMergedType, FormUnionType } from './types';

export const registerOrganizationForm: MultiStepFormProps<
  FormUnionType,
  FormMergedType
>['forms'] = [orgInfoForm, signatoryInfoForm];
