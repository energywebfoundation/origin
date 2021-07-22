import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export const userApiErrorHandler = (error: any, t: TFunction) => {
  console.log(error);
  if (error?.data?.message) {
    showNotification(error.data.message, NotificationTypeEnum.Error);
  } else if (error?.response) {
    showNotification(error.response.data.message, NotificationTypeEnum.Error);
  } else if (error?.message) {
    showNotification(error.message, NotificationTypeEnum.Error);
  } else {
    console.warn(t('general.notifications.unknownError'), error);
    showNotification(
      t('general.notifications.unknownError'),
      NotificationTypeEnum.Error
    );
  }
};
