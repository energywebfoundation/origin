import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  paper: {
    padding: 20,
  },
  emptyTextWrapper: {
    width: '100%',
    height: 150,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalVolume: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
