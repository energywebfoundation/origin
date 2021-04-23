// @should localize

export enum IRECAccountType {
  Registrant = 0,
  Participant = 1,
  Both = 2,
}

export const IREC_ACCOUNT_TYPE_OPTIONS = [
  {
    value: IRECAccountType.Registrant,
    label: 'organization.registration.irecRegistrantDescription',
  },
  {
    value: IRECAccountType.Participant,
    label: 'organization.registration.irecParticipantDescription',
  },
  {
    value: IRECAccountType.Both,
    label: 'organization.registration.irecBothDescription',
  },
];
