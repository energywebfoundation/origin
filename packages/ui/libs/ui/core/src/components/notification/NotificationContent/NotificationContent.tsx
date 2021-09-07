import { CheckCircle, Info, Cancel, Warning } from '@material-ui/icons';
import React, { FC } from 'react';
import { NotificationTypeEnum } from '../showNotification';
import { useStyles } from './NotificationContent.styles';

export interface NotificationContentProps {
  message: string;
  type: NotificationTypeEnum;
}

const toastIcons = {
  info: <Info fontSize="large" />,
  success: <CheckCircle fontSize="large" />,
  error: <Cancel fontSize="large" />,
  warning: <Warning fontSize="large" />,
};

export const NotificationContent: FC<NotificationContentProps> = ({
  message,
  type,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      {toastIcons[type as keyof typeof toastIcons]}
      <div className={classes.textWrapper}>
        <span className={classes.title}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
