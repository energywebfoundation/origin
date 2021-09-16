import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: 10,
    },
  },
}));
