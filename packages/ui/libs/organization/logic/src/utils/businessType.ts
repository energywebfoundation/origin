import { IRECBusinessLegalStatusLabelsMap } from '@energyweb/utils-general';

export const formatOrganizationBusinessType = (
  businessType: number | string
): string => {
  return isNaN(Number(businessType))
    ? businessType
    : IRECBusinessLegalStatusLabelsMap[businessType];
};
