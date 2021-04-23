// @should use import from @energyweb/utils-general
export enum IRECBusinessLegalStatus {
  RegisteredIncorporatedBody = 1,
  PublicSectorEntity = 2,
  PrivateIndividual = 3,
}

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
      label: IRECBusinessLegalStatusLabelsMap[item],
    })),
  {
    value: 'Other',
    label: 'Other',
  },
];
