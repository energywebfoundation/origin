import { TopBarButtonData } from '@energyweb/origin-ui-core';

export const getTopBarButtonListMock = (
  isAuthenticated: boolean,
  onLogout: () => void
): TopBarButtonData[] => {
  return [
    {
      label: 'Register',
      url: '/auth/register',
      onClick: () => {
        console.log('Register clicked');
      },
      show: !isAuthenticated,
    },
    {
      label: 'Login',
      url: '/auth/login',
      show: !isAuthenticated,
      onClick: () => {
        console.log('Login clicked');
      },
    },
    {
      label: 'Logout',
      show: isAuthenticated,
      onClick: () => {
        onLogout();
      },
    },
  ];
};

export const userAndOrgDataMock = {
  userData: {
    userPending: false,
    userTooltip: '',
    username: 'John Doe',
  },
  orgData: {
    orgName: 'World Trade Organization',
    orgPending: true,
    orgTooltip: 'Your organization status is Pending',
  },
};
