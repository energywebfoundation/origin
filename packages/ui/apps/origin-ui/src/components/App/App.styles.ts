import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  navPaper: {
    backgroundColor: theme.palette.text.secondary,
    '& h6': {
      color: theme.palette.background.paper,
    },
    '& p': {
      color: theme.palette.background.paper,
    },
    '& span': {
      color: theme.palette.background.paper,
    },
    '& > ul > div': {
      borderTop: `1px solid ${LightenColor(theme.palette.text.secondary, 10)}`,
    },
    '& > li > a': {
      '&:hover': {
        backgroundColor: theme.palette.text.secondary,
      },
    },
  },
  topBar: {
    backgroundColor: theme.palette.text.secondary,
    '& svg': {
      fill: theme.palette.background.paper,
    },
    '& button > span': {
      color: theme.palette.background.paper,
    },
  },
}));
