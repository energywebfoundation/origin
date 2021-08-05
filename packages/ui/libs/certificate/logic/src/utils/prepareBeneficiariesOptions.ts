import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TFunction } from 'i18next';

export const prepareBeneficiariesOptions = (
  beneficiaries: BeneficiaryDTO[],
  t: TFunction
) => {
  return beneficiaries?.map((beneficiary) => ({
    label: `
    ${t('certificate.blockchainInbox.beneficiaryId')} ${
      beneficiary.irecBeneficiaryId
    },
    ${t('certificate.blockchainInbox.beneficiaryName')} ${
      beneficiary.organization.name
    }
    `,
    value: beneficiary.irecBeneficiaryId,
  }));
};
