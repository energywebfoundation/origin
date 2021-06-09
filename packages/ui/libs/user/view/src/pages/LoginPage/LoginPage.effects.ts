import { useUserLogInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useUserLogin } from '@energyweb/origin-ui-user-data';
import { useNavigate } from 'react-router';

export const useLogInPageEffects = () => {
  const navigate = useNavigate();

  const submitHandler = useUserLogin();
  const formConfig = useUserLogInFormConfig(submitHandler);

  const navigateToResetPassword = () => {
    navigate('/auth/reset-password');
  };

  const navigateToRegister = () => {
    navigate('/auth/register');
  };

  return { formConfig, navigateToResetPassword, navigateToRegister };
};
