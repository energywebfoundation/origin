import { DetailedCertificate } from '@energyweb/origin-ui-certificate-data';
import {
  EnergyFormatter,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';

export const useCertificateDataLogic = (certificate: DetailedCertificate) => {
  const { t } = useTranslation();

  return {
    certificateId: {
      title: t('certificate.detailView.certificateId'),
      text: certificate.blockchainPart?.id?.toString() || '-',
    },
    certifiedEnergy: {
      title: t('certificate.detailView.certifiedEnergy'),
      text: certificate.exchangePart?.amount
        ? PowerFormatter.format(parseInt(certificate.exchangePart?.amount))
        : '-',
    },
    claimed: {
      title: t('certificate.detailView.claimed'),
      text: certificate.blockchainPart?.isClaimed
        ? t('certificate.detailView.yes')
        : t('certificate.detailView.no'),
    },
    creationDate: {
      title: t('certificate.detailView.creationDate'),
      text: formatDate(certificate.blockchainPart?.creationTime * 1000),
    },
    generationStartDate: {
      title: t('certificate.detailView.generationStartDate'),
      text: formatDate(
        certificate.blockchainPart?.generationStartTime * 1000,
        true
      ),
    },
    generationEndDate: {
      title: t('certificate.detailView.generationEndDate'),
      text: formatDate(
        certificate.blockchainPart?.generationEndTime * 1000,
        true
      ),
    },
    claimedEnergy: certificate.blockchainPart?.energy?.claimedVolume
      ? {
          title: t('certificate.detailView.claimedEnergy'),
          text: EnergyFormatter.format(
            certificate.blockchainPart.energy.claimedVolume
          ),
        }
      : undefined,
    remainingEnergy: certificate.blockchainPart?.energy?.publicVolume
      ? {
          title: t('certificate.detailView.remainingEnergy'),
          text: EnergyFormatter.format(
            certificate.blockchainPart.energy.publicVolume
          ),
        }
      : undefined,
    claimBeneficiaries:
      certificate.blockchainPart?.claims?.length > 0
        ? {
            title: t('certificate.detailView.claimBeneficiaries'),
            listItems: certificate.blockchainPart.claims.map((claim) => {
              const {
                beneficiary,
                location,
                periodStartDate,
                periodEndDate,
                purpose,
              } = claim.claimData;
              return `${beneficiary}, ${location}, [From: ${formatDate(
                periodStartDate
              )}, To: ${formatDate(periodEndDate)}], Purpose: ${purpose}`;
            }),
          }
        : undefined,
  };
};
