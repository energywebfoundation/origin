import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
    maxWidth: '56px',
  },
  speedDial: {
    maxHeight: 30,
  },
  speedDialButton: {
    width: '28px',
    height: '28px',
    minHeight: '28px',
    backgroundColor: 'inherit',
    boxShadow: 'none',
    color: theme.palette.primary.main,
  },
  speedDialIcon: {
    fontSize: '16px',
    backgroundColor: 'inherit',
  },
  speedDialActionButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  speedDialActionTooltip: {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    whiteSpace: 'nowrap',
  },
}));
