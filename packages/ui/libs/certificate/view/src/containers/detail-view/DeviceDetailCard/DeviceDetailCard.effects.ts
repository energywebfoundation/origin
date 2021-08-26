import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useDeviceDetailCardEffects = (
  deviceId: ComposedPublicDevice['id']
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewDevice = () => {
    navigate(`/device/detail-view/${deviceId}`);
  };

  const viewDeviceText = t('certificate.detailView.viewDevice');

  return { viewDeviceText, handleViewDevice };
};
