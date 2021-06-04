import {
  getUserControllerMeQueryKey,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedUser = () => {
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const user: UserDTO = queryClient.getQueryData(userQueryKey);

  return user;
};
