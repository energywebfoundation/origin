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
  indicatorContainer: {
    position: 'absolute',
    textAlign: 'left',
    maxWidth: 150,
    [theme.breakpoints.up('lg')]: {
      left: 250,
      bottom: 25,
    },
    [theme.breakpoints.down('lg')]: {
      left: 225,
      bottom: 15,
    },
    [theme.breakpoints.down('md')]: {
      left: 200,
      bottom: 10,
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 100,
      left: 180,
    },
  },
}));
