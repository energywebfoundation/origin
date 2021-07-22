import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  nameBlockWrapper: {
    width: '50%',
    paddingLeft: 15,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
  specBlockWrapper: {
    width: '50%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 15,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center',
      paddingRight: 0,
    },
  },
  button: {
    textTransform: 'none',
    fontSize: '0.8rem',
    paddingLeft: 5,
    paddingRight: 5,
  },
  buttonEndIcon: {
    marginLeft: 0,
  },
  specFieldGrid: {
    alignItems: 'center',
  },
  specFieldWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  specFieldValue: {
    color: theme.palette.text.primary,
    fontSize: '1.2rem',
    margin: '0 20px',
  },
}));
