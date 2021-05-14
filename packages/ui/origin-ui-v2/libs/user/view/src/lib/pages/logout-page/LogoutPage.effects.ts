import { useAuthDispatchLogoutUser } from '@energy-web/origin-ui-api-clients';

export const useLogoutPageEffects = () => {
  const logoutUser = useAuthDispatchLogoutUser();
  return { logoutUser };
};
