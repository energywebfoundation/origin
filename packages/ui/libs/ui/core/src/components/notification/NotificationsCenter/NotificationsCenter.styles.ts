import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  toast: {
    '&.Toastify__toast--default': {
      background: theme.palette.background.paper,
      color: theme.palette.primary.contrastText,
      opacity: 0.9,
      borderBottom: `1px solid ${theme.palette.primary.main}`,
      padding: theme.spacing(2),
    },
  },
}));
