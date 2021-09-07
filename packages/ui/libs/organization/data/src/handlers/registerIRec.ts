import {
  getRegistrationControllerGetRegistrationsQueryKey,
  IRECAccountType,
  NewRegistrationDTO,
  useRegistrationControllerRegister,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export type IRecRegistrationInfoForm = {
  accountType: IRECAccountType;
  headquarterCountry: FormSelectOption[];
  registrationYear: string;
  employeesNumber: string;
  shareholders: string;
  website: string;
  activeCountries: FormSelectOption[];
  mainBusiness: string;
  ceoName: string;
  ceoPassportNumber: string;
  balanceSheetTotal: string;
};

export type PrimaryContactDetailsForms = {
  primaryContactOrganizationName: string;
  primaryContactOrganizationAddress: string;
  primaryContactOrganizationPostalCode: string;
  primaryContactOrganizationCountry: FormSelectOption[];
  subsidiaries?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  primaryContactFax: string;
};

type LeadUserDetailsForms = {
  leadUserTitle: string;
  leadUserTitleInput?: string;
  leadUserFirstName: string;
  leadUserLastName: string;
  leadUserEmail: string;
  leadUserPhoneNumber: string;
  leadUserFax: string;
};

export type IRecRegisterFormMergedType = IRecRegistrationInfoForm &
  PrimaryContactDetailsForms &
  LeadUserDetailsForms;

export const useIRecRegisterHandler = (openRegisteredModal: () => void) => {
  const { mutate } = useRegistrationControllerRegister();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const iRecOrgKey = getRegistrationControllerGetRegistrationsQueryKey();

  return (values: IRecRegisterFormMergedType) => {
    const formattedData: NewRegistrationDTO = {
      ...values,
      headquarterCountry: values.headquarterCountry
        .map((option) => option.value)[0]
        .toString(),
      primaryContactOrganizationCountry: values.primaryContactOrganizationCountry
        .map((option) => option.value)[0]
        .toString(),
      // @should be changed on backend and migrated
      // from int to string because of auto-gen client/enum issues
      accountType: (values.accountType as unknown) as IRECAccountType,
      registrationYear: Number(values.registrationYear),
      activeCountries: values.activeCountries.map((i) => i?.value as string),
      leadUserTitle:
        values.leadUserTitle === 'Other'
          ? values.leadUserTitleInput
          : values.leadUserTitle,
    };
    mutate(
      { data: formattedData },
      {
        onSuccess: () => {
          navigate('/organization/my');
          openRegisteredModal();
          queryClient.invalidateQueries(iRecOrgKey);
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.registerIRec.notifications.registerError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
