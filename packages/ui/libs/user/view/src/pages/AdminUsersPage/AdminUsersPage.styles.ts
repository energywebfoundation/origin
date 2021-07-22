import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: {
    [theme.breakpoints.down('md')]: {
      padding: 15,
    },
    [theme.breakpoints.up('sm')]: {
      padding: 30,
    },
  },
}));
