import { MultiStepFormProps } from '@energyweb/origin-ui-core';
import { leadUserDetals } from './leadUserDetails';
import { primaryContactDetails } from './primaryContactDetails';
import { registrationInfo } from './registrationInfo';
import { FormUnionType, FormMergedType } from './types';

export const registerIRecForm: MultiStepFormProps<
  FormUnionType,
  FormMergedType
>['forms'] = [registrationInfo, primaryContactDetails, leadUserDetals];
