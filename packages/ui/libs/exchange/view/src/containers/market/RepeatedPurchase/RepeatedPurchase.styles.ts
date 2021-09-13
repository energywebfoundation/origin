import { makeStyles } from '@material-ui/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

export const useStyles = makeStyles((theme) => ({
  wraper: {
    padding: '0 20px 20px 20px',
  },
  block: {
    width: '100%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  item: {
    margin: '5px 10px',
    width: '50%',
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      margin: 5,
    },
  },
  divider: {
    margin: 10,
    borderColor: LightenColor(theme.palette.background.paper, 6.8),
  },
}));
