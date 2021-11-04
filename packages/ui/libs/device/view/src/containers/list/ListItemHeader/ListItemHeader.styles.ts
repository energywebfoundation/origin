import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndName: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: 20,
    },
  },
  icon: {
    width: 30,
  },
});
