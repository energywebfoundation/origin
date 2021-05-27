import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  card: {
    display: 'flex',
    cursor: 'pointer',
    margin: theme.spacing(1),
  },
  selectedCard: {
    boxShadow: `0 0 3pt 2pt ${LightenColor(
      theme.palette.background.paper,
      40,
      theme.palette.mode
    )}`,
  },
  image: {
    width: 160,
    height: 140,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
  },
  header: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      8,
      theme.palette.mode
    ),
  },
}));
