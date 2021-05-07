// @should-change type from void to actual return value
import { NewOrganizationDTO } from '@energyweb/origin-backend-react-query-client';

type TSubmitOrganizationRegister = (values: NewOrganizationDTO) => void;

export const submitOrganizationRegister: TSubmitOrganizationRegister = (
  values
) => {
  console.log(values);
};
