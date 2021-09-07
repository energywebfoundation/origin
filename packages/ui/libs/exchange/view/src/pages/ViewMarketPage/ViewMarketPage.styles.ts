import { makeStyles } from '@material-ui/core';
import { LightenColor, HexToRGBA } from '@energyweb/origin-ui-theme';

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    marginBottom: 20,
    boxShadow: 'none',
  },
  filtersPaper: {
    backgroundColor: LightenColor(theme.palette.background.paper, 3),
    padding: '20px 20px 0 20px',
    boxShadow: `0 0 4px 0 ${HexToRGBA(theme.palette.common.black, 13)}`,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundImage: 'none',
  },
  tabsPaper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    boxShadow: `0 2px 4px 0 ${HexToRGBA(theme.palette.common.black, 13)}`,
  },
  scroller: {
    marginBottom: `4px !important`,
    boxShadow: `0 0 4px 2px ${HexToRGBA(theme.palette.common.black, 13)}`,
    backgroundColor: LightenColor(theme.palette.background.paper, 3),
    paddingTop: 5,
    '& .Mui-selected': {
      color: theme.palette.text.primary,
    },
  },
  tabs: {
    '&, & + div': {
      backgroundColor: LightenColor(theme.palette.background.paper, 2.1),
    },
  },
}));
