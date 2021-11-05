import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      overflowX: 'auto',
    },
  },
}));
