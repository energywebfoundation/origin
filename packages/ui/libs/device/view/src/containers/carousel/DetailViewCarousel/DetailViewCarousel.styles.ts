import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  item: {
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      height: 380,
    },
    [theme.breakpoints.down('lg')]: {
      height: 250,
    },
    [theme.breakpoints.down('md')]: {
      height: 220,
    },
    [theme.breakpoints.down('sm')]: {
      height: 200,
    },
    objectFit: 'cover',
    borderRadius: 5,
  },
}));
