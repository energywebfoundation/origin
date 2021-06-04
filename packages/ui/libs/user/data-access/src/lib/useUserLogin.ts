import {
  LoginDataDTO,
  useAppControllerLogin,
} from '@energyweb/origin-backend-react-query-client';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useNavigate } from 'react-router';

export const useUserLogin = () => {
  const navigate = useNavigate();

  const { mutate } = useAppControllerLogin();

  return (values: LoginDataDTO) => {
    mutate(
      { data: values },
      {
        onSuccess: ({ accessToken }) => {
          setAuthenticationToken(accessToken);
        },
        onSettled: () => {
          navigate('/');
        },
      }
    );
  };
};
