import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    marginBottom: 20,
    padding: '10px 0',
  },
  dataWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  eventsItem: {
    padding: '10px 20px',
    [theme.breakpoints.down('md')]: {
      '& > p': {
        fontSize: '0.8em',
      },
    },
    [theme.breakpoints.down('sm')]: {
      '& > p': {
        fontSize: '0.5em',
      },
    },
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  blockItem: {
    padding: '18px 26px',
  },
  beneficiariesList: {
    padding: 0,
    margin: 0,
    fontFamily: theme.typography.fontFamily,
  },
}));
