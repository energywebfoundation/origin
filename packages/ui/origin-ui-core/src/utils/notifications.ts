import toastr from 'toastr';
import { getI18n } from 'react-i18next';

export interface INotificationOptions {
    timeOut?: number;
}

export enum NotificationType {
    Success = 'success',
    Info = 'info',
    Error = 'error',
    Warning = 'warning'
}

const DEFAULT_OPTIONS: INotificationOptions = {
    timeOut: 6000
};

export function showNotification(
    message: string,
    type: NotificationType = NotificationType.Info,
    options: INotificationOptions = DEFAULT_OPTIONS
): void {
    toastr[type.toLowerCase()](message, getI18n().t(`notification.type.${type}`), options);
}
