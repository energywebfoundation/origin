import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  blockWrapper: {
    width: '100%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  item: {
    margin: '0 10px',
    width: '50%',
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      margin: 10,
    },
  },
  singleItem: {
    margin: 10,
  },
  lastItem: {
    marginBottom: -10,
  },
}));
