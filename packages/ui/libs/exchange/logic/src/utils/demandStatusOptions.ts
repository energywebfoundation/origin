import { DemandStatus } from '@energyweb/exchange-irec-react-query-client';
import { TFunction } from 'i18next';

interface IStatusOption {
  value: DemandStatus;
  label: string;
}

export const demandStatusOptions = (t: TFunction): IStatusOption[] => {
  return [
    {
      value: DemandStatus.ACTIVE,
      label: t('exchange.properties.status.active'),
    },
    {
      value: DemandStatus.PAUSED,
      label: t('exchange.properties.status.paused'),
    },
  ];
};
