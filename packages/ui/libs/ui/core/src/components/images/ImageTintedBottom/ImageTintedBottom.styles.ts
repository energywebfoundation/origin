import { HexToRGBA } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  imgHolder: {
    position: 'relative',
  },
  tintedBottom: {
    height: 155,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    background: `linear-gradient(360deg,
      ${theme.palette.background.paper}
      12.5%, ${HexToRGBA(theme.palette.background.paper, 1)})`,
  },
}));
