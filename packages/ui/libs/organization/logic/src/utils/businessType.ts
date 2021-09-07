import { IRECBusinessLegalStatusLabelsMap } from '@energyweb/utils-general';

export const formatOrganizationBusinessType = (
  businessType: string
): string => {
  return IRECBusinessLegalStatusLabelsMap[
    (businessType as unknown) as keyof typeof IRECBusinessLegalStatusLabelsMap
  ];
};
