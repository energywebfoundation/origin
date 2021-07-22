import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  iconGrid: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  dialogActions: {
    padding: '16px 24px',
  },
}));
