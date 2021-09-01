import React, { FC } from 'react';
import { ToastContainer, ToastContainerProps, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  toast: {
    '&.Toastify__toast--default': {
      background: theme.palette.background.paper,
      color: theme.palette.primary.contrastText,
      opacity: 0.9,
      borderBottom: `1px solid ${theme.palette.primary.main}`,
      padding: theme.spacing(2),
      fontFamily: theme.typography.fontFamily,
    },
  },
}));

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
