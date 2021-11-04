import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    width: '100%',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  divider: {
    margin: '10px 0 15px',
  },
  logo: {
    marginTop: theme.spacing(12),
  },
}));
