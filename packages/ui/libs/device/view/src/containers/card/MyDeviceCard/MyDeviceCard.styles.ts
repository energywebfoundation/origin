import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  fallbackIconWrapper: {
    width: 70,
  },
  fallbackIcon: {
    fill: theme.palette.primary.main,
  },
}));
