import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    borderTop: `1px solid ${LightenColor(
      theme.palette?.background.paper,
      5,
      theme.palette?.mode
    )}`,
  },
}));
