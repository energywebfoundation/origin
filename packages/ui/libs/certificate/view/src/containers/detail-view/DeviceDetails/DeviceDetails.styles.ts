import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    position: 'relative',
  },
  images: {
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
  toggleButton: {
    textTransform: 'none',
  },
  toggleGroup: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  deviceName: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 2,
    [theme.breakpoints.up('lg')]: {
      fontSize: 26,
    },
    [theme.breakpoints.down('lg')]: {
      fontSize: 24,
      left: 10,
      bottom: 10,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 22,
      left: 10,
      bottom: 5,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 20,
    },
  },
}));
