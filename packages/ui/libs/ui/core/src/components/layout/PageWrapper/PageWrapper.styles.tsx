import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    [theme.breakpoints.up('lg')]: {
      padding: '40px 30px 40px 230px',
    },
    [theme.breakpoints.down('lg')]: {
      padding: '80px 10% 30px',
    },
  },
}));
