// @should-change type from void to actual return value
import { RegistrationDTO } from '@energyweb/origin-organization-irec-api-client';

type TSubmitIRecRegistration = (values: RegistrationDTO) => void;

export const submitIRecRegistration: TSubmitIRecRegistration = (values) => {
  console.log(values);
};
