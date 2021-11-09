import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  subtitle: {
    color: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
  },
  icon: {
    width: 30,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
  },
}));
