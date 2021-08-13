import { HexToRGBA, LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  card: {
    height: 160,
    width: 280,
    border: `0.5px solid ${LightenColor(
      theme.palette.background.paper,
      -5,
      theme.palette.mode
    )}`,
    boxSizing: 'border-box',
    borderRadius: 5,
    flexShrink: 0,
    boxShadow: 'none',
    transition: theme.transitions.create(['box-shadow', 'border'], {
      duration: 200,
    }),
    padding: 10,
    marginBottom: 10,
    '&:hover': {
      border: `0.5px solid ${HexToRGBA(theme.palette.primary.main, 60)}`,
      cursor: 'pointer',
    },
  },
  selected: {
    border: `0.5px solid ${LightenColor(
      theme.palette.background.paper,
      -5,
      theme.palette.mode
    )}`,
    boxShadow: `0 0 2pt 1pt ${LightenColor(
      theme.palette.primary.main,
      20,
      theme.palette.mode
    )}`,
  },
}));
