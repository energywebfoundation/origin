import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    marginBottom: 20,
    padding: 20,
    [theme.breakpoints.down('sm')]: {
      width: '80%',
    },
    [theme.breakpoints.up('sm')]: {
      width: '100%',
    },
  },
  wrapper: {
    padding: '0 40px',
    [theme.breakpoints.down('lg')]: {
      padding: 0,
      justifyContent: 'center',
    },
  },
}));
