import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: { width: '100%', padding: '30px' },
  wrapper: {
    padding: '0 40px',
    [theme.breakpoints.down('lg')]: {
      padding: 0,
      justifyContent: 'center',
    },
  },
}));
