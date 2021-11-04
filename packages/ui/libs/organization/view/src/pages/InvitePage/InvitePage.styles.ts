import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    padding: 20,
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    marginBottom: 0,
  },
}));
