import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  label: {
    color: theme.palette.text.secondary,
  },
  value: {
    color: theme.palette.text.primary,
    fontSize: '1.2rem',
  },
}));
