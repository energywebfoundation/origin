import { useUser } from '@energyweb/origin-ui-user-data';

export const useProfilePageEffects = () => {
  const { user, userLoading } = useUser();

  return { user, userLoading };
};
