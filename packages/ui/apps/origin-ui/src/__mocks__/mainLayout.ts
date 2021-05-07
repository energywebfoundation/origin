export const topBarButtons = [
  {
    label: 'Register',
    onClick: () => {
      console.log('Register clicked');
    },
  },
  {
    label: 'Login',
    onClick: () => {
      console.log('Login clicked');
    },
  },
];

export const userAndOrgData = {
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
