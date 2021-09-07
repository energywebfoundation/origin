import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  drawer: {
    '& > .MuiDrawer-paper': {
      width: 200,
      borderRight: 'none',
    },
  },
  logo: {
    margin: '20px',
    width: 120,
  },
  userAndOrg: {
    margin: '0 10px 20px 20px',
  },
  list: {
    padding: 0,
  },
});
