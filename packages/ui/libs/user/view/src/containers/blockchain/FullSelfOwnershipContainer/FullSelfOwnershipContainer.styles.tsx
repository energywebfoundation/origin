import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  iconPopover: {
    marginLeft: 20,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginBottom: 10,
    },
  },
}));
