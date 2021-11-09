import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  specsWrapper: {
    marginBottom: theme.spacing(1.5),
  },
  icon: {
    width: 25,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
  },
}));
