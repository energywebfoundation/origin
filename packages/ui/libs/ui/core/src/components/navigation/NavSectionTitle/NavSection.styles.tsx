import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: 0,
  },
  button: {
    justifyContent: 'flex-start',
    fontWeight: 600,
    letterSpacing: '0.1rem',
    padding: '10px 20px',
    width: '100%',
    color: theme.palette?.text.primary,
    '&:hover': {
      backgroundColor: LightenColor(
        theme.palette?.background.paper,
        5,
        theme.palette?.mode
      ),
    },
  },
}));
