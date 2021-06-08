import { useApiResendConfirmationEmail } from '@energyweb/origin-ui-user-data-access';

export const useUserResendConfirmationEmailEffects = () => {
  const { submitHandler, isLoading } = useApiResendConfirmationEmail();
  return { submitHandler, isLoading };
};
