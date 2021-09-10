import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  popoverTextBlock: {
    padding: '10px',
  },
  popoverPaper: {
    width: '30%',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
  },
}));
