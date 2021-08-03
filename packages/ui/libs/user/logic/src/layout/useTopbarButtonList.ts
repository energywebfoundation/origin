import { TopBarButtonData } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useTopbarButtonList = (
  isAuthenticated: boolean,
  onLogout: () => void
): TopBarButtonData[] => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return [
    {
      label: t('navigation.topbar.register'),
      show: !isAuthenticated,
      onClick: () => {
        navigate('/auth/register');
      },
    },
    {
      label: t('navigation.topbar.login'),
      show: !isAuthenticated,
      onClick: () => {
        navigate('/login');
      },
    },
    {
      label: t('navigation.topbar.logout'),
      show: isAuthenticated,
      onClick: onLogout,
    },
  ];
};
