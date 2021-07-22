import {
  getUserControllerMeQueryKey,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedUser = () => {
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  return queryClient.getQueryData<UserDTO>(userQueryKey);
};
