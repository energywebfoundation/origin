import { useAccount } from '@energyweb/origin-ui-user-view';

export const useUserAccountPageEffects = () => {
  const { userAccountData } = useAccount();
  return { userAccountData };
};
