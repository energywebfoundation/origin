import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  menuButton: {
    '&:hover': {
      backgroundColor: LightenColor(theme.palette.text.secondary, 7),
    },
  },
  selectedMenuItem: {
    backgroundColor: LightenColor(theme.palette.text.secondary, -5),
  },
}));
