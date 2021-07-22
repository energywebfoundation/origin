import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  split: {
    '&:hover': {
      cursor: 'pointer',
      transition: 'all 0.3s ease-in',
      backgroundColor: LightenColor(
        theme.palette.background.paper,
        5,
        theme.palette.mode
      ),
    },
  },
}));
