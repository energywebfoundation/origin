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
  logo: {
    margin: '20px',
    width: 120,
  },
  userAndOrg: {
    margin: '0 10px 20px 20px',
  },
});
