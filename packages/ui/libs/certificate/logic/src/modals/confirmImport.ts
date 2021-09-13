import { IrecAccountItemDto } from '@energyweb/issuer-irec-api-react-query-client';
import { GenericModalProps } from '@energyweb/origin-ui-core';
import { formatDate, PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';

export type TUseConfirmImportModalLogicArgs = {
  open: boolean;
  handleClose: () => void;
  certificate: IrecAccountItemDto;
  submitHandler: (assetId: IrecAccountItemDto['asset']) => void;
};

export const useConfirmImportModalLogic = ({
  open,
  handleClose,
  certificate,
  submitHandler,
}: TUseConfirmImportModalLogicArgs): GenericModalProps => {
  const { t } = useTranslation();
  return {
    open,
    title: t('certificate.modals.confirmImport.title'),
    text: t('certificate.modals.confirmImport.text', {
      volume: PowerFormatter.format(certificate?.volume),
      deviceName: certificate?.device?.name,
      timeFrame: `${formatDate(certificate?.startDate)} - ${formatDate(
        certificate?.endDate
      )}`,
    }),
    buttons: [
      {
        label: t('general.buttons.cancel'),
        onClick: () => handleClose(),
        variant: 'outlined',
      },
      {
        label: t('general.buttons.confirm'),
        onClick: () => {
          handleClose();
          submitHandler(certificate?.asset);
        },
      },
    ],
    dialogProps: { maxWidth: 'sm' },
  };
};
