import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    transition: '.5s ease',
    backgroundColor: theme.palette.background.paper,
    opacity: 0,
    '&:hover': {
      opacity: 0.8,
    },
    height: 180,
  },
  text: {
    color: theme.palette.primary.contrastText,
  },
}));
