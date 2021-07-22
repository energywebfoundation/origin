import { TFunction } from 'i18next';
import { IRECAccountType } from '../utils';

export const createIRecAccountTypeOptions = (t: TFunction) => [
  {
    value: IRECAccountType.Registrant,
    label: t('organization.registerIRec.accountType.registrant'),
  },
  {
    value: IRECAccountType.Participant,
    label: t('organization.registerIRec.accountType.participant'),
  },
  {
    value: IRECAccountType.Both,
    label: t('organization.registerIRec.accountType.both'),
  },
];
