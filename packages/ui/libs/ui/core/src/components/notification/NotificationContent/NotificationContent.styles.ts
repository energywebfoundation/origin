import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '0.8rem',
    fontWeight: 400,
  },
  title: {
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
});
