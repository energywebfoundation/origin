import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: 0,
  },
  frame: {
    height: '100%',
    flexWrap: 'nowrap',
    boxSizing: 'border-box',
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap',
    },
  },
  titleWrapper: {
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      maxWidth: '100%',
    },
  },
  title: {
    color: theme.palette.text.primary,
    fontSize: 18,
    lineHeight: '27px',
  },
  dates: {
    margin: '0 0 0 19px',
    width: 'auto',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      justifyContent: 'center',
      margin: '20px 0 0',
    },
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '10px 0 0',
    },
  },
  divider: {
    margin: '0 4px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '5px 0',
    },
  },
}));
