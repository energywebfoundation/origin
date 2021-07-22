import { HexToRGBA } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = (height: number) => {
  return makeStyles((theme) => ({
    wrapper: {
      position: 'relative',
    },
    tintedBottom: {
      height: height || 150,
      width: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      background: `linear-gradient(360deg,
        ${theme.palette.background.paper}
        12.5%, ${HexToRGBA(theme.palette.background.paper, 1)})`,
    },
  }))();
};
