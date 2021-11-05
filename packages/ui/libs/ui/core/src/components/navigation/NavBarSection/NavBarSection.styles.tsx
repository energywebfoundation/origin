import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    borderTop: `1px solid ${LightenColor(
      theme.palette?.background.paper,
      5,
      theme.palette?.mode
    )}`,
  },
}));
