import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  container: {
    padding: 10,
    backgroundColor: LightenColor(theme.palette.background.paper, 0.5),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  iconPopover: {
    marginLeft: 20,
    display: 'flex',
    justifyContent: 'flex-end',
    '& svg': {
      fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
    },
  },
}));
