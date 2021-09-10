import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  subtitle: {
    marginBottom: theme.spacing(2),
  },
  headings: {
    color: LightenColor(theme.palette.text.secondary, 10, theme.palette.mode),
  },
  listItemIcon: {
    minWidth: 20,
  },
  bulletIcon: {
    fontSize: '0.5rem',
  },
}));
