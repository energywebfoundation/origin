import { useApiResendConfirmationEmail } from '@energyweb/origin-ui-user-data';

export const useUserResendConfirmationEmailEffects = () => {
  const { submitHandler, isLoading } = useApiResendConfirmationEmail();
  return { submitHandler, isLoading };
};
