import { IRECBusinessLegalStatus } from '@energyweb/utils-general';

export const IRECBusinessLegalStatusLabelsMap = {
  [IRECBusinessLegalStatus.RegisteredIncorporatedBody]:
    'Registered incorporated body',
  [IRECBusinessLegalStatus.PublicSectorEntity]: 'Public sector entity',
  [IRECBusinessLegalStatus.PrivateIndividual]: 'Private individual',
};

export const BUSINESS_LEGAL_TYPE_OPTIONS = [
  ...Object.keys(IRECBusinessLegalStatus)
    .filter((k) => !isNaN(Number(k)))
    .map((item) => ({
      value: item,
      label:
        IRECBusinessLegalStatusLabelsMap[
          (item as unknown) as keyof typeof IRECBusinessLegalStatusLabelsMap
        ],
    })),
  {
    value: 'Other',
    label: 'Other',
  },
];
