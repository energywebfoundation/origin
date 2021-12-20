import { DisabledFormViewProps } from '@energyweb/origin-ui-core';
import { RegistrationDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TFunction } from 'i18next';
import { Countries } from '@energyweb/utils-general';
import { IRECAccountType, iRecAccountTypeFormat } from '../utils';

type TOrganizationViewLogic = (
  t: TFunction,
  organization: RegistrationDTO
) => DisabledFormViewProps[];

export const getIRecOrganizationViewLogic: TOrganizationViewLogic = (
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
          iRecOrganization.accountType as unknown as IRECAccountType
        ),
        dataCy: 'registrationInfoFormTitle',
      },
      {
        label: t('organization.view.iRec.orgHeadquartersCountry'),
        value: Countries.find(
          (c) => c.code === iRecOrganization.headquarterCountry
        ).name,
        dataCy: 'orgHeadquartersCountry',
      },
      {
        label: t('organization.view.iRec.yearOfregisterIRec'),
        value: iRecOrganization.registrationYear,
        dataCy: 'yearOfregisterIRec',
      },
      {
        label: t('organization.view.iRec.numberOfEmployees'),
        value: iRecOrganization.employeesNumber,
        dataCy: 'numberOfEmployees',
      },
      {
        label: t('organization.view.iRec.shareholderNames'),
        value: iRecOrganization.shareholders,
        dataCy: 'shareholderNames',
      },
      {
        label: t('organization.view.iRec.orgWebsite'),
        value: iRecOrganization.website,
        dataCy: 'orgWebsite',
      },
      {
        label: t('organization.view.iRec.activeCountries'),
        value: Countries.filter((c) =>
          iRecOrganization.activeCountries.includes(c.code)
        )
          .map((country) => country.name)
          .join(', '),
        dataCy: 'activeCountries',
      },
      {
        label: t('organization.view.iRec.mainBusiness'),
        value: iRecOrganization.mainBusiness,
        dataCy: 'mainBusiness',
      },
      {
        label: t('organization.view.iRec.ceoName'),
        value: iRecOrganization.ceoName,
        dataCy: 'ceoName',
      },
      {
        label: t('organization.view.iRec.ceoPassport'),
        value: iRecOrganization.ceoPassportNumber,
        dataCy: 'ceoPassport',
      },
      {
        label: t('organization.view.iRec.balanceSheetTotal'),
        value: iRecOrganization.balanceSheetTotal,
        dataCy: 'balanceSheetTotal',
      },
    ],
  },
  {
    heading: t('organization.view.iRec.primaryContactFormTitle'),
    data: [
      {
        label: t('organization.view.iRec.primaryContactOrgName'),
        value: iRecOrganization.primaryContactOrganizationName,
        dataCy: 'primaryContactOrgName',
      },
      {
        label: t('organization.view.iRec.primaryContactOrgAddress'),
        value: iRecOrganization.primaryContactOrganizationAddress,
        dataCy: 'primaryContactOrgAddress',
      },
      {
        label: t('organization.view.iRec.primaryContactOrgPostalCode'),
        value: iRecOrganization.primaryContactOrganizationPostalCode,
        dataCy: 'primaryContactOrgPostalCode',
      },
      {
        label: t('organization.view.iRec.primaryContactOrgCountry'),
        value: Countries.find(
          (c) => c.code === iRecOrganization.primaryContactOrganizationCountry
        ).name,
        dataCy: 'primaryContactOrgCountry',
      },
      {
        label: t('organization.view.iRec.existingIRECOrg'),
        value: iRecOrganization.subsidiaries,
        dataCy: 'existingIRECOrg',
      },
      {
        label: t('organization.view.iRec.primaryContactName'),
        value: iRecOrganization.primaryContactName,
        dataCy: 'primaryContactName',
      },
      {
        label: t('organization.view.iRec.primaryContactEmail'),
        value: iRecOrganization.primaryContactEmail,
        dataCy: 'primaryContactEmail',
      },
      {
        label: t('organization.view.iRec.primaryContactPhoneNumber'),
        value: iRecOrganization.primaryContactPhoneNumber,
        dataCy: 'primaryContactPhoneNumber',
      },
      {
        label: t('organization.view.iRec.primaryContactFax'),
        value: iRecOrganization.primaryContactFax,
        dataCy: 'primaryContactFax',
      },
    ],
  },
  {
    heading: t('organization.view.iRec.leadUserFormTitle'),
    data: [
      {
        label: t('organization.view.iRec.leadUserTitle'),
        value: iRecOrganization.leadUserTitle,
        dataCy: 'leadUserTitle',
      },
      {
        label: t('organization.view.iRec.leadUserFirstName'),
        value: iRecOrganization.leadUserFirstName,
        dataCy: 'leadUserFirstName',
      },
      {
        label: t('organization.view.iRec.leadUserLastName'),
        value: iRecOrganization.leadUserLastName,
        dataCy: 'leadUserLastName',
      },
      {
        label: t('organization.view.iRec.leadUserEmail'),
        value: iRecOrganization.leadUserEmail,
        dataCy: 'leadUserEmail',
      },
      {
        label: t('organization.view.iRec.leadUserPhoneNumber'),
        value: iRecOrganization.leadUserPhoneNumber,
        dataCy: 'leadUserPhoneNumber',
      },
      {
        label: t('organization.view.iRec.leadUserFax'),
        value: iRecOrganization.leadUserFax,
        dataCy: 'leadUserFax',
      },
    ],
  },
];
