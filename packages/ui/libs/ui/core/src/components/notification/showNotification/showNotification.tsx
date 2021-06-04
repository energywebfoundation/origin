import React from 'react';
import { toast, ToastContent, ToastOptions, Slide } from 'react-toastify';
import { NotificationContent } from '../NotificationContent';

export enum NotificationTypeEnum {
  Info = 'info',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Custom = 'custom',
}

export const showNotification = (
  content: ToastContent,
  type?: NotificationTypeEnum,
  options?: ToastOptions
) => {
  if (type === NotificationTypeEnum.Custom) {
    return toast(content, options);
  }

  return toast(
    <NotificationContent
      message={content as string}
      type={type || NotificationTypeEnum.Info}
    />,
    options
  );
};
