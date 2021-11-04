import { makeStyles } from '@mui/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

export const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: LightenColor(
      theme.palette?.background.paper,
      5,
      theme.palette?.mode
    ),
  },
  button: {
    color: LightenColor(theme.palette?.text.secondary, 5, theme.palette?.mode),
    '&:hover': {
      backgroundColor: LightenColor(
        theme.palette?.background.paper,
        10,
        theme.palette?.mode
      ),
    },
  },
}));
