import { DisabledFormViewProps } from '@energyweb/origin-ui-core';
import { RegistrationDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TFunction } from 'i18next';
import { iRecAccountTypeFormat } from '../utils';
import { IRECAccountType } from '@energyweb/origin-ui-utils';
import { Countries } from '@energyweb/utils-general';

type TOrganizationViewLogic = (
  t: TFunction,
  organization: RegistrationDTO
) => DisabledFormViewProps[];

export const iRecOrganizationViewLogic: TOrganizationViewLogic = (
  t,
  iRecOrganization
) => [
  {
    heading: t('organization.view.iRec.registrationInfoFormTitle'),
    data: [
      {
        label: t('organization.view.iRec.accountTypeLabel'),
        value: iRecAccountTypeFormat(
          t,
          (iRecOrganization.accountType as unknown) as IRECAccountType
        ),
      },
      {
        label: t('organization.view.iRec.orgHeadquartersCountry'),
        value: Countries.find(
          (c) => c.code === iRecOrganization.headquarterCountry
        ).name,
      },
      {
        label: t('organization.view.iRec.yearOfregisterIRec'),
        value: iRecOrganization.registrationYear,
      },
      {
        label: t('organization.view.iRec.numberOfEmployees'),
        value: iRecOrganization.employeesNumber,
      },
      {
        label: t('organization.view.iRec.shareholderNames'),
        value: iRecOrganization.shareholders,
      },
      {
        label: t('organization.view.iRec.orgWebsite'),
        value: iRecOrganization.website,
      },
      {
        label: t('organization.view.iRec.activeCountries'),
        value: Countries.filter((c) =>
          iRecOrganization.activeCountries.includes(c.code)
        )
          .map((country) => country.name)
          .join(', '),
      },
      {
        label: t('organization.view.iRec.mainBusiness'),
        value: iRecOrganization.mainBusiness,
      },
      {
        label: t('organization.view.iRec.ceoName'),
        value: iRecOrganization.ceoName,
      },
      {
        label: t('organization.view.iRec.ceoPassport'),
        value: iRecOrganization.ceoPassportNumber,
      },
      {
        label: t('organization.view.iRec.balanceSheetTotal'),
        value: iRecOrganization.balanceSheetTotal,
      },
    ],
  },
  {
    heading: t('organization.view.iRec.primaryContactFormTitle'),
    data: [
      {
        label: t('organization.view.iRec.primaryContactOrgName'),
        value: iRecOrganization.primaryContactOrganizationName,
      },
      {
        label: t('organization.view.iRec.primaryContactOrgAddress'),
        value: iRecOrganization.primaryContactOrganizationAddress,
      },
      {
        label: t('organization.view.iRec.primaryContactOrgPostalCode'),
        value: iRecOrganization.primaryContactOrganizationPostalCode,
      },
      {
        label: t('organization.view.iRec.primaryContactOrgCountry'),
        value: Countries.find(
          (c) => c.code === iRecOrganization.primaryContactOrganizationCountry
        ).name,
      },
      {
        label: t('organization.view.iRec.existingIRECOrg'),
        value: iRecOrganization.subsidiaries,
      },
      {
        label: t('organization.view.iRec.primaryContactName'),
        value: iRecOrganization.primaryContactName,
      },
      {
        label: t('organization.view.iRec.primaryContactEmail'),
        value: iRecOrganization.primaryContactEmail,
      },
      {
        label: t('organization.view.iRec.primaryContactPhoneNumber'),
        value: iRecOrganization.primaryContactPhoneNumber,
      },
      {
        label: t('organization.view.iRec.primaryContactFax'),
        value: iRecOrganization.primaryContactFax,
      },
    ],
  },
  {
    heading: t('organization.view.iRec.leadUserFormTitle'),
    data: [
      {
        label: t('organization.view.iRec.leadUserTitle'),
        value: iRecOrganization.leadUserTitle,
      },
      {
        label: t('organization.view.iRec.leadUserFirstName'),
        value: iRecOrganization.leadUserFirstName,
      },
      {
        label: t('organization.view.iRec.leadUserLastName'),
        value: iRecOrganization.leadUserLastName,
      },
      {
        label: t('organization.view.iRec.leadUserEmail'),
        value: iRecOrganization.leadUserEmail,
      },
      {
        label: t('organization.view.iRec.leadUserPhoneNumber'),
        value: iRecOrganization.leadUserPhoneNumber,
      },
      {
        label: t('organization.view.iRec.leadUserFax'),
        value: iRecOrganization.leadUserFax,
      },
    ],
  },
];
