export enum IRECBusinessLegalStatus {
    RegisteredIncorporatedBody = 1,
    PublicSectorEntity = 2,
    PrivateIndividual = 3
}

export const IRECBusinessLegalStatusLabelsMap = {
    [IRECBusinessLegalStatus.RegisteredIncorporatedBody]: 'Registered incorporated body',
    [IRECBusinessLegalStatus.PublicSectorEntity]: 'Public sector entity',
    [IRECBusinessLegalStatus.PrivateIndividual]: 'Private individual'
};
