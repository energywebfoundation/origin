import toastr from 'toastr';

export interface INotificationOptions {
    timeOut?: number;
}

export enum NotificationType {
    Success = 'Success',
    Info = 'Info',
    Error = 'Error',
    Warning = 'Warning'
}

const DEFAULT_OPTIONS: INotificationOptions = {
    timeOut: 6000
};

export function showNotification(message: string, type: NotificationType = NotificationType.Info, options: INotificationOptions = DEFAULT_OPTIONS): void {
    toastr[type.toLowerCase()](message, type, options);
}