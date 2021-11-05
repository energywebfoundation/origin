import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
  },
  lightBlock: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      2,
      theme.palette.mode
    ),
  },
  darkBlock: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      -2,
      theme.palette.mode
    ),
  },
  divider: {
    borderColor: LightenColor(
      theme.palette.background.paper,
      -2,
      theme.palette.mode
    ),
  },
}));
