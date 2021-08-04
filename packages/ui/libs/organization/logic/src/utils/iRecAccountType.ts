import { TFunction } from 'i18next';

export enum IRECAccountType {
  Registrant = 0,
  Participant = 1,
  Both = 2,
}

export const iRecAccountTypeFormat = (t: TFunction, type: IRECAccountType) => {
  switch (type) {
    case IRECAccountType.Participant:
      return t('organization.view.iRec.accountType.participant');
    case IRECAccountType.Registrant:
      return t('organization.view.iRec.accountType.registrant');
    case IRECAccountType.Both:
      return t('organization.view.iRec.accountType.both');
  }
};
