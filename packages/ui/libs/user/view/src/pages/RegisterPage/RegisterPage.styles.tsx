import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      padding: 15,
    },
    [theme.breakpoints.up('md')]: {
      padding: 20,
    },
  },
}));
