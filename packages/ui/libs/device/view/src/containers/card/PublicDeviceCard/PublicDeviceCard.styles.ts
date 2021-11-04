import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    minWidth: 240,
  },
  icon: {
    width: 80,
    padding: 50,
    fill: theme.palette.primary.main,
  },
}));
