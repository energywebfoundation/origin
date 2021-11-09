import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));
