import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  item: {
    [theme.breakpoints.up('md')]: {
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(1),
      paddingLeft: theme.spacing(1),
    },
  },
}));
