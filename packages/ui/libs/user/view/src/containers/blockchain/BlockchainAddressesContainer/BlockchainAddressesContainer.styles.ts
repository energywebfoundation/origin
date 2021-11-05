import { makeStyles } from '@mui/styles';

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
}));
