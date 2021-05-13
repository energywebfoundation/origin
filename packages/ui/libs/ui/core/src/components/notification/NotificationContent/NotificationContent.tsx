import { CheckCircle, Info, Cancel, Warning } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  // not sure if want to keep i18 here in core package
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      {toastIcons[type]}
      <div className={classes.textWrapper}>
        <span className={classes.title}>
          {t(`notifications.title.${type}`)}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
