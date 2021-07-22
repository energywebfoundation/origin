import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
  },
  icon: {
    width: 40,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
    marginRight: 20,
  },
  infoBlock: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndType: {
    display: 'flex',
    alignItems: 'center',
  },
  dateBlock: {
    marginRight: 20,
  },
  button: {
    height: 30,
  },
}));
