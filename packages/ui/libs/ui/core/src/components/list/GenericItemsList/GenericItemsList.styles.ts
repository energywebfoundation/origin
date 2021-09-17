import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  selectAllHolder: {
    display: 'flex',
    alignItems: 'center',
  },
  paperWrapper: {
    padding: 20,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
  },
}));
