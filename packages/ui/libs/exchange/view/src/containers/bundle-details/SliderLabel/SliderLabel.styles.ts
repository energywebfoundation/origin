import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  tooltip: {
    backgroundColor: theme.palette.primary.main,
  },
}));
