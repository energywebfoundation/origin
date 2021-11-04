import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  lightBgRounded: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      5,
      theme.palette.mode
    ),
    borderRadius: 10,
    margin: '10px auto',
  },
  dialogContent: {
    padding: 0,
  },
}));
