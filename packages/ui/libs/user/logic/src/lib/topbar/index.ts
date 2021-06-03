import { TopBarButtonData } from '@energyweb/origin-ui-core';

export const getTopBarButtonList = (
  isAuthenticated: boolean,
  onLogout: () => void
): TopBarButtonData[] => {
  return [
    {
      label: 'Register',
      url: '/auth/register',
      onClick: () => {},
      show: !isAuthenticated,
    },
    {
      label: 'Login',
      url: '/auth/login',
      show: !isAuthenticated,
      onClick: () => {},
    },
    {
      label: 'Logout',
      show: isAuthenticated,
      onClick: onLogout,
    },
  ];
};
