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
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));
