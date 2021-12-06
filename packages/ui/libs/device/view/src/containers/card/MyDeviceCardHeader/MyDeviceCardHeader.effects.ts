import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useMyDeviceCardHeaderEffects = (
  viewDetailsLink: string,
  editDeviceLink: string
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const viewDetailsClickHandler = () => navigate(viewDetailsLink);
  const editDeviceClickHandler = () => navigate(editDeviceLink);

  return { viewDetailsClickHandler, editDeviceClickHandler, t };
};
