import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(5),
  },
}));
