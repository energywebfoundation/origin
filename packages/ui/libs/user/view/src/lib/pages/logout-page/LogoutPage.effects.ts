import { useAuthDispatchLogoutUser } from '@energyweb/origin-ui-react-query-providers';

export const useLogoutPageEffects = () => {
  const logoutUser = useAuthDispatchLogoutUser();
  return { logoutUser };
};
