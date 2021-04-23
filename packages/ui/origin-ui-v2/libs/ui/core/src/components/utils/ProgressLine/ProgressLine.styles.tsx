import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    zIndex: 100,
  },
  line: {
    height: 5,
    backgroundColor: theme.palette?.primary.main,
  },
}));
