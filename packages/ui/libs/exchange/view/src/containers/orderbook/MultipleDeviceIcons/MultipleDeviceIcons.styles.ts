import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  icon: {
    width: 20,
    margin: '0 5px',
    fill: theme.palette.primary.main,
  },
  iconHolder: {
    display: 'flex',
    flexDirection: 'row',
  },
  popoverContent: {
    padding: '10px',
  },
}));
