import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  block: {
    width: '100%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      marginTop: 5,
      flexDirection: 'column',
    },
  },
  item: {
    margin: '5px 10px',
    width: '50%',
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      margin: 5,
    },
  },
  divider: {
    margin: 10,
  },
}));
