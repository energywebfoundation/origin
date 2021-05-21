import {
  GenericModalProps,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useIRecAccountRegisteredLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useIRecAccountRegisteredEffects = () => {
  const { iRecAccountRegistered: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();
  const { t } = useTranslation();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED,
      payload: false,
    });

    showNotification(
      t('organization.registerIRec.notifications.registerSuccess'),
      NotificationTypeEnum.Success
    );

    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU,
      payload: true,
    });
  };

  const { title, text, buttons } = useIRecAccountRegisteredLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
