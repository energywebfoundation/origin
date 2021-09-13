import React from 'react';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { IrecAccountItemDto } from '@energyweb/issuer-irec-api-react-query-client';
import { ListItemsContainerProps } from '@energyweb/origin-ui-core';
import { useApiCertificateToImport } from '@energyweb/origin-ui-certificate-data';
import { formatDate, PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import {
  CertificateModalsActionsEnum,
  useCertificateModalsDispatch,
} from '../../../context';
import { ImportListItemContent } from '../ImportListItemContent';
import { ImportListItemHeader } from '../ImportListItemHeader';

export const useCertificatesToImportListEffects = (
  allFuelTypes: CodeNameDTO[]
) => {
  const { certificates, isLoading } = useApiCertificateToImport();

  const { t } = useTranslation();
  const listTitle = t('certificate.import.certificatesToImport');

  const dispatchModals = useCertificateModalsDispatch();

  const handleImportModalOpen = (certificate: IrecAccountItemDto) => {
    dispatchModals({
      type: CertificateModalsActionsEnum.SHOW_CONFIRM_IMPORT,
      payload: {
        open: true,
        certificate,
      },
    });
  };

  const listItems: ListItemsContainerProps<
    IrecAccountItemDto['asset'],
    IrecAccountItemDto['asset']
  >[] = certificates?.map((certificate) => {
    const generationTimeFrame = `${formatDate(
      certificate.startDate
    )} - ${formatDate(certificate.endDate)}`;
    return {
      id: certificate.asset,
      containerHeader: (
        <ImportListItemHeader
          allFuelTypes={allFuelTypes}
          fuelType={certificate.fuelType.code}
          deviceName={certificate.device.name}
          importHandler={() => handleImportModalOpen(certificate)}
        />
      ),
      containerItems: [
        {
          id: certificate.code,
          itemContent: (
            <ImportListItemContent
              volume={PowerFormatter.format(certificate.volume)}
              generationTimeFrame={generationTimeFrame}
            />
          ),
        },
      ],
    };
  });

  return { listItems, isLoading, listTitle };
};
