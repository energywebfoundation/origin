import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  selected: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      3,
      theme.palette.mode
    ),
  },
  listItem: {
    padding: 0,
  },
  button: {
    justifyContent: 'flex-start',
    textTransform: 'none',
    padding: '10px 20px',
    width: '100%',
    margin: '0',
    color: LightenColor(theme.palette?.text.secondary, 5, theme.palette?.mode),
    '&:hover': {
      backgroundColor: LightenColor(
        theme.palette?.background.paper,
        5,
        theme.palette?.mode
      ),
    },
  },
}));
