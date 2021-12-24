import { TopBarButtonData } from '@energyweb/origin-ui-core';
import { TFunction } from 'react-i18next';
import { NavigateFunction } from 'react-router';
import { HowToReg, AccountCircle, ExitToApp } from '@mui/icons-material';

export const getTopbarButtonList = (
  isAuthenticated: boolean,
  onLogout: () => void,
  t: TFunction,
  navigate: NavigateFunction
): TopBarButtonData[] => {
  return [
    {
      label: t('navigation.topbar.register'),
      show: !isAuthenticated,
      onClick: () => {
        navigate('/auth/register');
      },
      Icon: HowToReg,
      dataCy: 'navigation-register-button',
    },
    {
      label: t('navigation.topbar.login'),
      show: !isAuthenticated,
      onClick: () => {
        navigate('/login');
      },
      Icon: AccountCircle,
      dataCy: 'navigation-login-button',
    },
    {
      label: t('navigation.topbar.logout'),
      show: isAuthenticated,
      onClick: onLogout,
      Icon: ExitToApp,
      dataCy: 'navigation-logout-button',
    },
  ];
};
