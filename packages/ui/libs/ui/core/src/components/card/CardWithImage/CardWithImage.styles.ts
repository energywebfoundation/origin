import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  image: {
    width: 250,
    height: 180,
  },
  card: {
    width: 250,
  },
  imageWrapper: {
    width: 250,
    height: 180,
  },
  heading: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      10,
      theme.palette.mode
    ),
  },
}));
