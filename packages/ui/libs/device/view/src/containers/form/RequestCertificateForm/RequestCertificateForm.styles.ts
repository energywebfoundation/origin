import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  formWrapper: {
    margin: 35,
  },
  dropzone: {
    borderRadius: 5,
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      6,
      theme.palette.mode
    ),
  },
}));
