import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: 10,
    },
  },
}));
