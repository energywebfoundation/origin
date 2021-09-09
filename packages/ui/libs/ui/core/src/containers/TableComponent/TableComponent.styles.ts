import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      overflowX: 'auto',
    },
  },
}));
