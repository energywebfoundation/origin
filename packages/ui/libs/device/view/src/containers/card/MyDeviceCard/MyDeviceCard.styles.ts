import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  fallbackIconWrapper: {
    width: 70,
  },
  fallbackIcon: {
    fill: theme.palette.primary.main,
  },
}));
