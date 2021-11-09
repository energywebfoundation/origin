import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '80%',
    padding: '30px',
    [theme.breakpoints.down('md')]: {
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
