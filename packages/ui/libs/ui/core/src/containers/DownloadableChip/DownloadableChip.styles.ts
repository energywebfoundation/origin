import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  chip: {
    backgroundColor: LightenColor(
      theme.palette.primary.contrastText,
      -10,
      theme.palette.mode
    ),
  },
}));
