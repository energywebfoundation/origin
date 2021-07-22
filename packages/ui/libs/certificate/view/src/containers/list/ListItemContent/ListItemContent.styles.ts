import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
    marginRight: 20,
  },
  infoBlock: {
    display: 'flex',
  },
  button: {
    height: 30,
  },
}));
