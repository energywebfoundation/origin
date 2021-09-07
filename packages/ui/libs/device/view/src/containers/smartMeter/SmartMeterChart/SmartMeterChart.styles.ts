import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  buttonsWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  chartWrapper: {
    bottom: 0,
    minHeight: 300,
    maxHeight: 450,
  },
  dateWrapper: {
    marginBottom: 10,
    textAlign: 'center',
  },
});
