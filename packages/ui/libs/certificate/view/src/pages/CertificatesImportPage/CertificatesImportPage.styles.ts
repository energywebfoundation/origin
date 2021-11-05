import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  item: {
    width: '50%',
    margin: '0 20px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: '10px 0',
    },
  },
}));
