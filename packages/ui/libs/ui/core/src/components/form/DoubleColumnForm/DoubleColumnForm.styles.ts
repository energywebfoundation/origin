import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  secondColumn: {
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: 0,
    },
  },
}));
