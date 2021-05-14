import {
  IRECAccountType,
  NewRegistrationDTO,
  useRegistrationControllerRegister,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { IRecRegisterFormMergedType } from '@energyweb/origin-ui-organization-logic';

export const useIRecRegisterHandler = () => {
  const { mutate } = useRegistrationControllerRegister();
  return (values: IRecRegisterFormMergedType) => {
    const formattedData: NewRegistrationDTO = {
      ...values,
      // @should be changed on backend and migrated
      //from int to string because of auto-gen client/enum issues
      accountType: (values.accountType as unknown) as IRECAccountType,
      registrationYear: Number(values.registrationYear),
      activeCountries: values.activeCountries.map((i) => i?.value as string),
    };
    mutate({ data: formattedData });
  };
};
