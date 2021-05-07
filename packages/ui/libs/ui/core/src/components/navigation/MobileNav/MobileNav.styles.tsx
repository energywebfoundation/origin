import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  drawer: {
    '& > .MuiDrawer-paper': {
      width: '100%',
    },
  },
  list: {
    padding: 0,
  },
});
