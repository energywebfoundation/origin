import React, { FC } from 'react';
import { ToastContainer, ToastContainerProps, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useStyles } from './NotificationsCenter.styles';

export interface NotificationsCenterProps {
  containerProps?: ToastContainerProps;
}

export const NotificationsCenter: FC<NotificationsCenterProps> = ({
  containerProps,
}) => {
  const classes = useStyles();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      closeButton={false}
      transition={Slide}
      toastClassName={classes.toast}
      {...containerProps}
    />
  );
};
