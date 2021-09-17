import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles({
  icon: {
    fontSize: 80,
  },
  paper: {
    '& > .MuiGrid-root': {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '15px 0',
    },
    '& .MuiDialogContent-root': {
      padding: 0,
    },
  },
});
